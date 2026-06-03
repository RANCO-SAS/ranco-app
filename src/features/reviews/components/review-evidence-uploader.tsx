import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReviewEvidenceGallery } from '@/features/reviews/components/review-evidence-gallery';
import { ReviewFormSectionLabel } from '@/features/reviews/components/review-form-section-label';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useUpdateReviewEvidence } from '@/features/reviews/hooks/use-reviews';
import {
  createRemotePhotoItem,
  type ServiceRequestPhotoItem,
} from '@/features/jobs/types/service-request-photo.types';
import { storageService } from '@/services/storage/storage.service';

type ReviewEvidenceUploaderProps = {
  reviewId: string;
  reviewerId: string;
  initialUrls?: string[];
};

export function ReviewEvidenceUploader({
  reviewId,
  reviewerId,
  initialUrls = [],
}: ReviewEvidenceUploaderProps) {
  const updateEvidence = useUpdateReviewEvidence();
  const [photos, setPhotos] = useState<ServiceRequestPhotoItem[]>(() =>
    initialUrls.map((url) => createRemotePhotoItem(url)),
  );
  const [isUploading, setIsUploading] = useState(false);

  const canAddMore = photos.length < storageService.maxReviewEvidenceImages;
  const isBusy = isUploading || updateEvidence.isPending;

  const syncEvidence = async (nextPhotos: ServiceRequestPhotoItem[]) => {
    const review = await updateEvidence.mutateAsync({
      reviewId,
      reviewerId,
      evidenceUrls: nextPhotos.map((photo) => photo.uri),
    });

    setPhotos(review.evidenceUrls.map((url) => createRemotePhotoItem(url)));
  };

  const handlePickImage = async () => {
    if (!canAddMore || isBusy) {
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

    try {
      setIsUploading(true);
      const uploadedUrl = await storageService.uploadReviewEvidence(
        reviewerId,
        reviewId,
        result.assets[0].uri,
        photos.length,
      );

      await syncEvidence([...photos, createRemotePhotoItem(uploadedUrl)]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (photoId: string) => {
    if (isBusy) {
      return;
    }

    const nextPhotos = photos.filter((photo) => photo.id !== photoId);
    await syncEvidence(nextPhotos);
  };

  return (
    <View style={styles.container}>
      <ReviewFormSectionLabel>Subir imágenes (opcional)</ReviewFormSectionLabel>
      {isBusy ? (
        <AppText color="textMuted" variant="caption">
          Subiendo imágenes...
        </AppText>
      ) : null}
      <ReviewEvidenceGallery
        canAddMore={canAddMore}
        disabled={isBusy}
        onAdd={() => {
          void handlePickImage();
        }}
        onRemove={(photoId) => {
          void handleRemove(photoId);
        }}
        photos={photos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
