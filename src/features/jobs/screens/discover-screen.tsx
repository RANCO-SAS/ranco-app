import { useMemo, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JobMapView, type JobMapViewHandle } from '@/components/map/job-map-view';
import { LocationStatusBanner } from '@/components/map/location-status-banner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { JobOpportunityCard } from '@/features/jobs/components/discover/job-opportunity-card';
import { usePublishedServiceRequests } from '@/features/jobs/hooks/use-service-requests';
import { usePublishedJobsRealtime } from '@/features/jobs/hooks/use-published-jobs-realtime';
import { devLog } from '@/lib/dev-logger';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { useStartConversation } from '@/features/messages/hooks/use-conversations';
import { ActiveModeBanner } from '@/features/profile/components/active-mode-banner';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';
import { useUserLocation } from '@/hooks/use-user-location';
import { useTheme } from '@/hooks/use-theme';
import {
  getDistanceKm,
  hasValidCoordinates,
  toMapCoordinate,
} from '@/shared/utils/geo';

type NearbyOpportunity = ServiceRequest & {
  distanceKm: number | null;
};

export function DiscoverScreen() {
  const theme = useTheme();
  const router = useRouter();
  const listRef = useRef<FlatList<NearbyOpportunity>>(null);
  const mapRef = useRef<JobMapViewHandle>(null);
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const isProfessionalMode = activeMode === 'professional';
  const startConversation = useStartConversation();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const {
    location: userLocation,
    access: locationAccess,
    isLoading: isLocationLoading,
    refresh: refreshLocation,
    openSettings: openLocationSettings,
  } = useUserLocation({
    enabled: Boolean(profile?.isProfessional && isProfessionalMode),
    requestPermissionOnMount: true,
  });

  const publishedRequests = usePublishedServiceRequests(
    Boolean(profile?.isProfessional && isProfessionalMode),
  );

  usePublishedJobsRealtime({
    enabled: Boolean(profile?.isProfessional && isProfessionalMode),
  });

  useEffect(() => {
    devLog('location', 'discover:access-state', {
      issue: locationAccess.issue,
      servicesEnabled: locationAccess.servicesEnabled,
      permissionStatus: locationAccess.permissionStatus,
      hasLocation: Boolean(userLocation),
    });
  }, [locationAccess, userLocation]);

  const professionalAreas = profile?.professionalSubcategoryIds ?? [];

  const filteredRequests = useMemo(() => {
    if (!profile) {
      return [];
    }

    return (publishedRequests.data ?? []).filter(
      (request) =>
        request.clientId !== profile.id &&
        professionalAreas.includes(request.subcategoryId),
    );
  }, [profile, professionalAreas, publishedRequests.data]);

  const mapReadyRequests = useMemo(
    () => filteredRequests.filter((request) => hasValidCoordinates(request.locationLat, request.locationLng)),
    [filteredRequests],
  );

  const nearbyOpportunities = useMemo<NearbyOpportunity[]>(() => {
    return mapReadyRequests
      .map((request) => {
        const coordinate = toMapCoordinate(request.locationLat, request.locationLng);

        return {
          ...request,
          distanceKm: userLocation && coordinate ? getDistanceKm(userLocation, coordinate) : null,
        };
      })
      .sort((left, right) => (left.distanceKm ?? Number.POSITIVE_INFINITY) - (right.distanceKm ?? Number.POSITIVE_INFINITY));
  }, [mapReadyRequests, userLocation]);

  const markers = useMemo(
    () =>
      nearbyOpportunities.flatMap((request) => {
        const coordinate = toMapCoordinate(request.locationLat, request.locationLng);

        if (!coordinate) {
          return [];
        }

        return [
          {
            id: request.id,
            coordinate,
            title: request.title,
            selected: request.id === selectedRequestId,
          },
        ];
      }),
    [nearbyOpportunities, selectedRequestId],
  );

  const handleContact = (serviceRequestId: string, clientId: string) => {
    if (!profile) {
      return;
    }

    startConversation.mutate(
      {
        serviceRequestId,
        clientId,
        professionalId: profile.id,
      },
      {
        onSuccess: (conversation) => {
          router.push(Routes.app.conversation(conversation.id));
        },
      },
    );
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);

    const index = nearbyOpportunities.findIndex((request) => request.id === requestId);

    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  };

  const renderOpportunity: ListRenderItem<NearbyOpportunity> = ({ item }) => (
    <JobOpportunityCard
      distanceKm={item.distanceKm}
      isContactLoading={startConversation.isPending}
      onContactPress={() => handleContact(item.id, item.clientId)}
      onDetailsPress={() => router.push(Routes.app.jobDetail(item.id))}
      onPress={() => handleSelectRequest(item.id)}
      request={item}
      selected={item.id === selectedRequestId}
    />
  );

  if (publishedRequests.isLoading) {
    return (
      <View style={[styles.centeredState, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} size="large" />
        <AppText color="textSecondary" variant="body">
          Buscando oportunidades...
        </AppText>
      </View>
    );
  }

  if (publishedRequests.error) {
    return (
      <SafeAreaView edges={['top']} style={[styles.guardScreen, { backgroundColor: theme.background }]}>
        <View style={styles.guardContent}>
          <AppText variant="title">Oportunidades</AppText>
          <Card>
            <AppText color="destructive" variant="body">
              No pudimos cargar oportunidades. Inténtalo de nuevo.
            </AppText>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile?.isProfessional) {
    return (
      <SafeAreaView edges={['top']} style={[styles.guardScreen, { backgroundColor: theme.background }]}>
        <View style={styles.guardContent}>
          <AppText variant="title">Oportunidades</AppText>
          <EmptyState
            description="Activa el rol de profesional en tu perfil para ver oportunidades."
            title="Rol profesional no activo"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isProfessionalMode) {
    return (
      <SafeAreaView edges={['top']} style={[styles.guardScreen, { backgroundColor: theme.background }]}>
        <View style={styles.guardContent}>
          <ModeGateEmptyState requiredMode="professional" />
        </View>
      </SafeAreaView>
    );
  }

  if (professionalAreas.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.guardScreen, { backgroundColor: theme.background }]}>
        <View style={styles.guardContent}>
          <EmptyState
            description="Configura qué servicios ofreces para recibir solicitudes relevantes."
            title="Define tu oficio"
          />
          <Button
            label="Configurar áreas de servicio"
            onPress={() => router.push(Routes.app.activateProfessional)}
            variant="dark"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <JobMapView
        ref={mapRef}
        markers={markers}
        onMarkerPress={handleSelectRequest}
        selectedId={selectedRequestId}
        showUserLocation={locationAccess.issue === 'none'}
        userLocation={userLocation}
      />

      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.topOverlay}>
        <View style={[styles.topPanel, { backgroundColor: theme.background }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <AppText variant="title">Oportunidades</AppText>
              <AppText color="textSecondary" variant="caption">
                {nearbyOpportunities.length} en mapa · tiempo real
                {userLocation ? ' · GPS activo' : locationAccess.isReady ? ' · sin GPS' : ''}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSelectedRequestId(null);
                void refreshLocation({ requestPermission: true });
                void publishedRequests.refetch();
              }}
              style={[styles.refreshButton, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
              <AppText variant="small">{isLocationLoading ? '...' : '↻'}</AppText>
            </Pressable>
          </View>
          <ActiveModeBanner mode="professional" />

          <LocationStatusBanner
            access={locationAccess}
            onOpenSettings={() => {
              void openLocationSettings();
            }}
            onRequestPermission={() => {
              void refreshLocation({ requestPermission: true });
            }}
          />
        </View>
      </SafeAreaView>

      <View style={styles.bottomPanel}>
        {nearbyOpportunities.length === 0 ? (
          <View style={[styles.emptyPanel, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <AppText variant="bodyMedium">Sin oportunidades en el mapa</AppText>
            <AppText color="textSecondary" variant="caption">
              {filteredRequests.length > 0
                ? 'Hay solicitudes en tus áreas, pero aún no tienen ubicación en mapa.'
                : 'Cuando haya solicitudes en tus áreas de servicio, aparecerán aquí en tiempo real.'}
            </AppText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            contentContainerStyle={styles.carouselContent}
            data={nearbyOpportunities}
            getItemLayout={(_, index) => ({
              length: 312,
              offset: 312 * index,
              index,
            })}
            horizontal
            keyExtractor={(item) => item.id}
            onScrollToIndexFailed={() => undefined}
            renderItem={renderOpportunity}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      {userLocation ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSelectedRequestId(null);
            mapRef.current?.centerOnUser();
          }}
          style={[styles.recenterButton, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <AppText variant="small">Mi zona</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  guardScreen: {
    flex: 1,
  },
  guardContent: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Layout.screenPaddingVertical,
    gap: Spacing.lg,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topPanel: {
    marginHorizontal: Layout.screenPaddingHorizontal,
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.lg,
  },
  carouselContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    gap: Spacing.md,
  },
  emptyPanel: {
    marginHorizontal: Layout.screenPaddingHorizontal,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  recenterButton: {
    position: 'absolute',
    right: Layout.screenPaddingHorizontal,
    bottom: 170,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
