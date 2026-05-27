import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ServiceRequestPhotoGalleryProps = {
  photoUrls: string[];
};

export function ServiceRequestPhotoGallery({ photoUrls }: ServiceRequestPhotoGalleryProps) {
  const theme = useTheme();

  if (photoUrls.length === 0) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.gallery}>
        {photoUrls.map((url) => (
          <Image
            key={url}
            contentFit="cover"
            source={{ uri: url }}
            style={[styles.image, { backgroundColor: theme.backgroundElement }]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gallery: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  image: {
    width: 112,
    height: 112,
    borderRadius: Radius.md,
  },
});
