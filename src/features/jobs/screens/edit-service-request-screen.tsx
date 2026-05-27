import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { StackHeader } from '@/components/layout/stack-header';
import { AuthMessage } from '@/features/auth/components/auth-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ServiceRequestPhotoPicker } from '@/features/jobs/components/service-request-photo-picker';
import { StickyFormFooter } from '@/features/jobs/components/create-request/sticky-form-footer';
import { UrgencySelector } from '@/features/jobs/components/create-request/urgency-selector';
import { useServiceRequest } from '@/features/jobs/hooks/use-service-requests';
import { useUpdateServiceRequest } from '@/features/jobs/hooks/use-update-service-request';
import {
  updateServiceRequestSchema,
  type UpdateServiceRequestFormData,
} from '@/features/jobs/schemas/update-service-request.schema';
import {
  createRemotePhotoItem,
  type ServiceRequestPhotoItem,
} from '@/features/jobs/types/service-request-photo.types';
import { canClientEditServiceRequest } from '@/features/jobs/utils/can-client-edit-service-request';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { Layout, Spacing } from '@/constants/theme';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';
import { ModeGateEmptyState } from '@/features/profile/components/mode-gate-empty-state';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useCurrentProfile } from '@/features/profile/hooks/use-current-profile';

const DESCRIPTION_MAX = 1000;
const TITLE_MAX = 80;

export function EditServiceRequestScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { profile } = useCurrentProfile();
  const { activeMode } = useActiveMode();
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestQuery = useServiceRequest(id);
  const updateRequest = useUpdateServiceRequest();
  const [photos, setPhotos] = useState<ServiceRequestPhotoItem[]>([]);
  const { keyboardBehavior, keyboardVerticalOffset } = useKeyboardLayout();

  const request = requestQuery.data;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateServiceRequestFormData>({
    resolver: zodResolver(updateServiceRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      urgency: 'normal',
      locationLabel: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!request) {
      return;
    }

    reset({
      title: request.title,
      description: request.description,
      urgency: request.urgency,
      locationLabel: request.locationLabel ?? '',
    });
    setPhotos(request.photoUrls.map(createRemotePhotoItem));
  }, [request, reset]);

  const titleValue = watch('title');
  const descriptionValue = watch('description');
  const titleLength = titleValue.trim().length;
  const descriptionLength = descriptionValue.trim().length;

  const canEdit = useMemo(
    () => Boolean(request && canClientEditServiceRequest(request.status)),
    [request],
  );

  const onSubmit = (data: UpdateServiceRequestFormData) => {
    if (!session?.userId || !request) {
      return;
    }

    updateRequest.mutate({
      requestId: request.id,
      clientId: session.userId,
      photos,
      ...data,
    });
  };

  if (!profile?.isClient || activeMode !== 'client') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StackHeader title="Editar solicitud" />
        <View style={styles.guardContent}>
          <ModeGateEmptyState requiredMode="client" />
        </View>
      </SafeAreaView>
    );
  }

  if (requestQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StackHeader title="Editar solicitud" />
        <View style={styles.guardContent}>
          <AppText color="textSecondary" variant="body">
            Cargando solicitud...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (requestQuery.error || !request) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StackHeader title="Editar solicitud" />
        <View style={styles.guardContent}>
          <EmptyState title="Solicitud no disponible" />
        </View>
      </SafeAreaView>
    );
  }

  if (!canEdit) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StackHeader title="Editar solicitud" />
        <View style={styles.guardContent}>
          <EmptyState title="Esta solicitud ya no se puede editar" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StackHeader title="Editar solicitud" />

      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Card>
            <AppText variant="caption" color="textSecondary">
              Servicio
            </AppText>
            <Spacer size="xs" />
            <AppText variant="bodyMedium">
              {request.subcategoryName} · {request.categoryName}
            </AppText>
            <Spacer size="sm" />
            <AppText color="textMuted" variant="small">
              El servicio no se puede cambiar una vez publicada la solicitud.
            </AppText>
          </Card>

          <View style={styles.stepContent}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldGroup}>
                  <Input
                    editable={!updateRequest.isPending}
                    error={errors.title?.message}
                    label="Título"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <AppText color="textMuted" variant="small">
                    {titleLength}/{TITLE_MAX}
                  </AppText>
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldGroup}>
                  <Input
                    editable={!updateRequest.isPending}
                    error={errors.description?.message}
                    label="Descripción"
                    multiline
                    numberOfLines={6}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Describe qué necesitas"
                    style={styles.textArea}
                    value={value}
                  />
                  <AppText color="textMuted" variant="small">
                    {descriptionLength}/{DESCRIPTION_MAX}
                  </AppText>
                </View>
              )}
            />

            <Controller
              control={control}
              name="locationLabel"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldGroup}>
                  <Input
                    editable={!updateRequest.isPending}
                    error={errors.locationLabel?.message}
                    label="Ubicación"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Barrio, calle, portal o referencia"
                    value={value}
                  />
                </View>
              )}
            />

            <ServiceRequestPhotoPicker
              disabled={updateRequest.isPending}
              onChange={setPhotos}
              photos={photos}
            />

            <Controller
              control={control}
              name="urgency"
              render={({ field: { value, onChange } }) => (
                <UrgencySelector
                  disabled={updateRequest.isPending}
                  error={errors.urgency?.message}
                  onChange={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {updateRequest.error ? (
            <AuthMessage
              message={updateRequest.error.message || 'No pudimos guardar los cambios.'}
              variant="error"
            />
          ) : null}
        </ScrollView>

        <StickyFormFooter
          onPrimaryPress={() => {
            void handleSubmit(onSubmit)();
          }}
          primaryDisabled={updateRequest.isPending}
          primaryLabel={updateRequest.isPending ? 'Guardando...' : 'Guardar cambios'}
          primaryLoading={updateRequest.isPending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  stepContent: {
    gap: Spacing.lg,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  guardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
});
