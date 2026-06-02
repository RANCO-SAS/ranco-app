import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { LocationMapPickerModal } from '@/features/jobs/components/create-request/location-map-picker-modal';
import { useTheme } from '@/hooks/use-theme';
import { pointToMapRegion } from '@/shared/location/default-map-region';
import type { LocationPoint } from '@/shared/location/location.types';

type RequestLocationFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  coordinates?: LocationPoint | null;
  onCoordinatesChange?: (point: LocationPoint | null) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
};

export function RequestLocationField({
  value,
  onChange,
  onBlur,
  coordinates = null,
  onCoordinatesChange,
  error,
  disabled = false,
  placeholder = 'Barrio, calle, portal o referencia',
}: RequestLocationFieldProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const displayValue = value.trim();
  const hasLocation = displayValue.length > 0;
  const hasCoordinates = Boolean(coordinates);

  const openEditor = () => {
    if (disabled) {
      return;
    }

    setIsEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const openMapPicker = () => {
    if (disabled) {
      return;
    }

    setIsMapPickerVisible(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onBlur?.();
  };

  return (
    <View style={styles.wrapper}>
      <AppText color="textSecondary" variant="label">
        Ubicación
      </AppText>

      {isEditing ? (
        <TextInput
          ref={inputRef}
          autoFocus
          editable={!disabled}
          onBlur={handleBlur}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: error ? theme.destructive : theme.primary,
              color: theme.text,
            },
          ]}
          value={value}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={openEditor}
          style={[
            styles.selector,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: error ? theme.destructive : theme.border,
            },
          ]}>
          <AppIcon color={theme.primary} name="location-outline" size={20} />
          <AppText
            color={hasLocation ? 'text' : 'textMuted'}
            numberOfLines={1}
            style={styles.selectorText}
            variant="bodyMedium">
            {hasLocation ? displayValue : 'Selecciona o escribe tu ubicación'}
          </AppText>
          <Pressable accessibilityRole="button" disabled={disabled} hitSlop={8} onPress={openMapPicker}>
            <AppIcon color={theme.textMuted} name="map-outline" size={18} />
          </Pressable>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={openMapPicker}
        style={[styles.mapPreview, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        {hasCoordinates && coordinates ? (
          <MapView
            key={`${coordinates.lat}-${coordinates.lng}`}
            initialRegion={pointToMapRegion(coordinates, {
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            })}
            pointerEvents="none"
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            scrollEnabled={false}
            style={styles.mapPreviewMap}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: coordinates.lat,
                longitude: coordinates.lng,
              }}
            />
          </MapView>
        ) : (
          <>
            <View style={[styles.mapGridLine, styles.mapGridHorizontal, { backgroundColor: theme.border }]} />
            <View style={[styles.mapGridLine, styles.mapGridVertical, { backgroundColor: theme.border }]} />
            <View style={[styles.pin, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <AppIcon color={theme.primary} name="location" size={18} />
            </View>
          </>
        )}

        <View style={[styles.mapHint, { backgroundColor: `${theme.background}DD` }]}>
          <AppText color="textSecondary" variant="small">
            {hasCoordinates ? 'Toca para ajustar ubicación' : 'Toca para elegir en el mapa'}
          </AppText>
        </View>
      </Pressable>

      {error ? (
        <AppText color="destructive" variant="small">
          {error}
        </AppText>
      ) : null}

      <LocationMapPickerModal
        initialLabel={value}
        initialPoint={coordinates}
        onClose={() => setIsMapPickerVisible(false)}
        onConfirm={(selection) => {
          onChange(selection.label);
          onCoordinatesChange?.(selection.point);
          setIsMapPickerVisible(false);
        }}
        visible={isMapPickerVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  selector: {
    minHeight: Layout.minTouchTarget + 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  selectorText: {
    flex: 1,
  },
  input: {
    minHeight: Layout.minTouchTarget + 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    paddingVertical: Spacing.md,
  },
  mapPreview: {
    height: 160,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapPreviewMap: {
    ...StyleSheet.absoluteFill,
  },
  mapGridLine: {
    position: 'absolute',
    opacity: 0.45,
  },
  mapGridHorizontal: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    top: '50%',
  },
  mapGridVertical: {
    height: '100%',
    width: StyleSheet.hairlineWidth,
    left: '50%',
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: {
    position: 'absolute',
    bottom: Spacing.md,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
