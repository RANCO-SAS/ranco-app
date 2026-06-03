import * as ImagePicker from 'expo-image-picker';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Spacer } from '@/components/ui/spacer';
import { AppText } from '@/components/ui/text';
import { ZoomableImage } from '@/components/ui/zoomable-image';
import { Layout, Radius, Spacing } from '@/constants/theme';
import {
  createLocalPhotoItem,
  type ServiceRequestPhotoItem,
} from '@/features/jobs/types/service-request-photo.types';
import { useTheme } from '@/hooks/use-theme';
import { storageService } from '@/services/storage/storage.service';

type ServiceRequestPhotoPickerProps = {
  photos: ServiceRequestPhotoItem[];
  onChange: (photos: ServiceRequestPhotoItem[]) => void;
  disabled?: boolean;
  variant?: 'default' | 'details';
};

export function ServiceRequestPhotoPicker({
  photos,
  onChange,
  disabled = false,
  variant = 'default',
}: ServiceRequestPhotoPickerProps) {
  const theme = useTheme();
  const canAddMore = photos.length < storageService.maxRequestPhotos;

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

  if (variant === 'details') {
    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <AppText variant="bodyMedium">Multimedia</AppText>
          <AppText color="textSecondary" variant="caption">
            Añade hasta {storageService.maxRequestPhotos} fotos para mostrar mejor lo que necesitas.
          </AppText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.detailsGallery}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.imageWrapper}>
                <ZoomableImage
                  contentFit="cover"
                  style={[styles.detailsImage, { backgroundColor: theme.backgroundElement }]}
                  uri={photo.uri}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={disabled}
                  onPress={() => handleRemove(photo.id)}
                  style={[styles.removeButton, { backgroundColor: theme.text }]}>
                  <AppText color="background" variant="small">
                    ×
                  </AppText>
                </Pressable>
              </View>
            ))}

            {canAddMore ? (
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => {
                  void handlePickImage();
                }}
                style={[
                  styles.addTile,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: theme.border,
                  },
                ]}>
                <AppIcon color={theme.primary} name="camera-outline" size={24} />
                <AppText color="primary" variant="caption">
                  Añadir
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="bodyMedium">Fotos (opcional)</AppText>
      <AppText color="textSecondary" variant="caption">
        Añade hasta {storageService.maxRequestPhotos} fotos para mostrar mejor lo que necesitas.
      </AppText>

      <Spacer size="md" />

      {photos.length > 0 ? (
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
                  onPress={() => handleRemove(photo.id)}
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
            disabled={disabled}
            label="Añadir foto"
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
    gap: Spacing.xs,
  },
  detailsContainer: {
    gap: Spacing.md,
  },
  detailsHeader: {
    gap: Spacing.xs,
  },
  gallery: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailsGallery: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 112,
    height: 112,
    borderRadius: Radius.md,
  },
  detailsImage: {
    width: 108,
    height: 108,
    borderRadius: Radius.lg,
  },
  addTile: {
    width: 108,
    height: 108,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
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
