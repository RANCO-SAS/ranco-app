import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { RequestLocationField } from '@/features/jobs/components/create-request/request-location-field';
import { ServiceRequestPhotoPicker } from '@/features/jobs/components/service-request-photo-picker';
import type { CreateServiceRequestFormData } from '@/features/jobs/schemas/create-service-request.schema';
import type { ServiceRequestPhotoItem } from '@/features/jobs/types/service-request-photo.types';
import { Spacing } from '@/constants/theme';

const DESCRIPTION_MAX = 1000;
const TITLE_MAX = 80;

type RequestDetailsStepProps = {
  control: Control<CreateServiceRequestFormData>;
  errors: FieldErrors<CreateServiceRequestFormData>;
  disabled?: boolean;
  photos: ServiceRequestPhotoItem[];
  onPhotosChange: (photos: ServiceRequestPhotoItem[]) => void;
  titleLength: number;
  descriptionLength: number;
  titlePlaceholder: string;
};

export function RequestDetailsStep({
  control,
  errors,
  disabled = false,
  photos,
  onPhotosChange,
  titleLength,
  descriptionLength,
  titlePlaceholder,
}: RequestDetailsStepProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title">Describe el problema</AppText>

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldGroup}>
            <Input
              editable={!disabled}
              error={errors.title?.message}
              label="Título"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={titlePlaceholder}
              value={value}
            />
            <AppText color="textMuted" style={styles.counter} variant="small">
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
            <View style={styles.textAreaWrap}>
              <Input
                editable={!disabled}
                error={errors.description?.message}
                label="Descripción"
                multiline
                numberOfLines={6}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Explica detalladamente lo que necesitas..."
                style={styles.textArea}
                value={value}
              />
              <AppText color="textMuted" style={styles.textAreaCounter} variant="small">
                {descriptionLength}/{DESCRIPTION_MAX}
              </AppText>
            </View>
          </View>
        )}
      />

      <ServiceRequestPhotoPicker
        disabled={disabled}
        onChange={onPhotosChange}
        photos={photos}
        variant="details"
      />

      <Controller
        control={control}
        name="locationLabel"
        render={({ field: { onChange, onBlur, value } }) => (
          <Controller
            control={control}
            name="locationLat"
            render={({ field: { value: latValue, onChange: onLatChange } }) => (
              <Controller
                control={control}
                name="locationLng"
                render={({ field: { value: lngValue, onChange: onLngChange } }) => (
                  <RequestLocationField
                    coordinates={
                      typeof latValue === 'number' && typeof lngValue === 'number'
                        ? { lat: latValue, lng: lngValue }
                        : null
                    }
                    disabled={disabled}
                    error={errors.locationLabel?.message}
                    onBlur={onBlur}
                    onChange={onChange}
                    onCoordinatesChange={(point) => {
                      onLatChange(point?.lat ?? null);
                      onLngChange(point?.lng ?? null);
                    }}
                    value={value ?? ''}
                  />
                )}
              />
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xl,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  counter: {
    alignSelf: 'flex-end',
  },
  textAreaWrap: {
    position: 'relative',
  },
  textArea: {
    minHeight: 148,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  textAreaCounter: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.md,
  },
});
