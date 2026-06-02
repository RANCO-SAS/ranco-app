import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { ZoomableImage } from '@/components/ui/zoomable-image';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceRequestPhotoItem } from '@/features/jobs/types/service-request-photo.types';
import { useTheme } from '@/hooks/use-theme';

type ReviewEvidenceGalleryProps = {
  photos: ServiceRequestPhotoItem[];
  disabled?: boolean;
  canAddMore?: boolean;
  onAdd?: () => void;
  onRemove: (photoId: string) => void;
};

export function ReviewEvidenceGallery({
  photos,
  disabled = false,
  canAddMore = false,
  onAdd,
  onRemove,
}: ReviewEvidenceGalleryProps) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.gallery}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.imageWrapper}>
            <ZoomableImage
              contentFit="cover"
              style={[styles.image, { backgroundColor: theme.backgroundElement }]}
              uri={photo.uri}
            />
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => onRemove(photo.id)}
              style={[styles.removeButton, { backgroundColor: theme.text }]}>
              <AppText color="background" variant="small">
                ×
              </AppText>
            </Pressable>
          </View>
        ))}

        {canAddMore && onAdd ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Añadir imagen"
            disabled={disabled}
            onPress={onAdd}
            style={[
              styles.addTile,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <AppIcon color={theme.primary} name="add" size={28} />
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gallery: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
  },
  addTile: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
