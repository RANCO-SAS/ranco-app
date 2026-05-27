import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { ZoomableImage } from '@/components/ui/zoomable-image';
import { Radius, Spacing } from '@/constants/theme';
import { useUpdateReviewEvidence } from '@/features/reviews/hooks/use-reviews';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();
  const updateEvidence = useUpdateReviewEvidence();
  const [evidenceUrls, setEvidenceUrls] = useState(initialUrls);
  const [isUploading, setIsUploading] = useState(false);

  const canAddMore = evidenceUrls.length < storageService.maxReviewEvidenceImages;

  const handlePickImage = async () => {
    if (!canAddMore || isUploading || updateEvidence.isPending) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    try {
      setIsUploading(true);
      const nextIndex = evidenceUrls.length;
      const uploadedUrl = await storageService.uploadReviewEvidence(
        reviewerId,
        reviewId,
        result.assets[0].uri,
        nextIndex,
      );
      const nextUrls = [...evidenceUrls, uploadedUrl];

      const review = await updateEvidence.mutateAsync({
        reviewId,
        reviewerId,
        evidenceUrls: nextUrls,
      });

      setEvidenceUrls(review.evidenceUrls);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (url: string) => {
    if (updateEvidence.isPending || isUploading) {
      return;
    }

    const nextUrls = evidenceUrls.filter((item) => item !== url);
    const review = await updateEvidence.mutateAsync({
      reviewId,
      reviewerId,
      evidenceUrls: nextUrls,
    });

    setEvidenceUrls(review.evidenceUrls);
  };

  return (
    <View style={styles.container}>
      <AppText variant="bodyMedium">Evidencia del trabajo (opcional)</AppText>
      <AppText color="textSecondary" variant="caption">
        Sube fotos para mostrar este trabajo en tu perfil.
      </AppText>

      <Spacer size="md" />

      {evidenceUrls.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gallery}>
            {evidenceUrls.map((url) => (
              <View key={url} style={styles.imageWrapper}>
                <ZoomableImage contentFit="cover" style={styles.image} uri={url} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void handleRemove(url);
                  }}
                  style={[styles.removeButton, { backgroundColor: theme.text }]}>
                  <AppText color="background" variant="small">
                    ×
                  </AppText>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {canAddMore ? (
        <>
          <Spacer size="md" />
          <Button
            disabled={isUploading || updateEvidence.isPending}
            label={
              isUploading || updateEvidence.isPending
                ? 'Subiendo evidencia...'
                : 'Añadir foto de evidencia'
            }
            onPress={() => {
              void handlePickImage();
            }}
            variant="secondary"
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  gallery: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 112,
    height: 112,
    borderRadius: Radius.md,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
