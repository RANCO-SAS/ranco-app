import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ImagePreviewModal } from '@/components/ui/image-preview-modal';
import { AppText } from '@/components/ui/text';
import { Radius } from '@/constants/theme';
import { resolveImageCachePolicy } from '@/shared/utils/image-uri';
import { useTheme } from '@/hooks/use-theme';

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: number;
  previewable?: boolean;
  previewTitle?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]?.slice(0, 1).toUpperCase() ?? '?';
  }

  return `${parts[0]?.slice(0, 1) ?? ''}${parts[1]?.slice(0, 1) ?? ''}`.toUpperCase();
}

export function Avatar({
  name,
  imageUrl,
  size = 44,
  previewable = false,
  previewTitle,
}: AvatarProps) {
  const theme = useTheme();
  const initials = getInitials(name);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const canPreview = previewable && Boolean(imageUrl);

  const avatarContent = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.backgroundElement,
        },
      ]}>
      {imageUrl ? (
        <Image
          cachePolicy={resolveImageCachePolicy(imageUrl)}
          contentFit="cover"
          recyclingKey={imageUrl}
          source={{ uri: imageUrl }}
          style={styles.image}
        />
      ) : (
        <AppText variant="bodyMedium">{initials}</AppText>
      )}
    </View>
  );

  return (
    <>
      {canPreview ? (
        <Pressable
          accessibilityLabel="Ver foto de perfil"
          accessibilityRole="button"
          onPress={() => setIsPreviewVisible(true)}>
          {avatarContent}
        </Pressable>
      ) : (
        avatarContent
      )}

      {canPreview && imageUrl ? (
        <ImagePreviewModal
          imageUrl={imageUrl}
          onClose={() => setIsPreviewVisible(false)}
          title={previewTitle ?? name}
          visible={isPreviewVisible}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.full,
  },
});
