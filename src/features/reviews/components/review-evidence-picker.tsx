import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, View } from 'react-native';

import { ReviewEvidenceGallery } from '@/features/reviews/components/review-evidence-gallery';
import { ReviewFormSectionLabel } from '@/features/reviews/components/review-form-section-label';
import {
  createLocalPhotoItem,
  type ServiceRequestPhotoItem,
} from '@/features/jobs/types/service-request-photo.types';
import { Spacing } from '@/constants/theme';
import { storageService } from '@/services/storage/storage.service';

type ReviewEvidencePickerProps = {
  photos: ServiceRequestPhotoItem[];
  onChange: (photos: ServiceRequestPhotoItem[]) => void;
  disabled?: boolean;
};

export function ReviewEvidencePicker({
  photos,
  onChange,
  disabled = false,
}: ReviewEvidencePickerProps) {
  const canAddMore = photos.length < storageService.maxReviewEvidenceImages;

  const handlePickImage = async () => {
    if (!canAddMore || disabled) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    onChange([...photos, createLocalPhotoItem(result.assets[0].uri)]);
  };

  const handleRemove = (photoId: string) => {
    if (disabled) {
      return;
    }

    onChange(photos.filter((photo) => photo.id !== photoId));
  };

  return (
    <View style={styles.container}>
      <ReviewFormSectionLabel>Subir imágenes (opcional)</ReviewFormSectionLabel>
      <ReviewEvidenceGallery
        canAddMore={canAddMore}
        disabled={disabled}
        onAdd={() => {
          void handlePickImage();
        }}
        onRemove={handleRemove}
        photos={photos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
});
