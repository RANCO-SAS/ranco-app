import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { Pressable, type StyleProp, type ImageStyle } from 'react-native';

import { ImagePreviewModal } from '@/components/ui/image-preview-modal';
import { resolveImageCachePolicy } from '@/shared/utils/image-uri';

type ZoomableImageProps = Omit<ImageProps, 'source'> & {
  uri: string;
  title?: string;
  previewDisabled?: boolean;
  style?: StyleProp<ImageStyle>;
};

export function ZoomableImage({
  uri,
  title,
  previewDisabled = false,
  style,
  accessibilityLabel = 'Ver imagen',
  contentFit = 'cover',
  ...imageProps
}: ZoomableImageProps) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const canPreview = !previewDisabled && Boolean(uri);

  return (
    <>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={!canPreview}
        onPress={() => setIsPreviewVisible(true)}>
        <Image
          cachePolicy={resolveImageCachePolicy(uri)}
          contentFit={contentFit}
          recyclingKey={uri}
          source={{ uri }}
          style={style}
          {...imageProps}
        />
      </Pressable>

      {canPreview ? (
        <ImagePreviewModal
          imageUrl={uri}
          onClose={() => setIsPreviewVisible(false)}
          title={title}
          visible={isPreviewVisible}
        />
      ) : null}
    </>
  );
}
