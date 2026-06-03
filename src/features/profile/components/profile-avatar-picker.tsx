import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Avatar } from '@/components/ui/avatar';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { devError, devLog } from '@/lib/dev-logger';
import { useTheme } from '@/hooks/use-theme';

type ProfileAvatarPickerProps = {
  name: string;
  value?: string | null;
  disabled?: boolean;
  onChange: (avatarUrl: string) => void;
  onError?: (message: string) => void;
  onUpload: (uri: string) => Promise<string>;
  size?: number;
  variant?: 'default' | 'onboarding';
};

export function ProfileAvatarPicker({
  name,
  value,
  disabled,
  onChange,
  onError,
  onUpload,
  size = 88,
  variant = 'default',
}: ProfileAvatarPickerProps) {
  const theme = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [localPreviewUri, setLocalPreviewUri] = useState<string | null>(null);
  const displayImageUrl = localPreviewUri ?? value;
  const isOnboarding = variant === 'onboarding';
  const avatarSize = isOnboarding ? 112 : size;

  const handlePickImage = async () => {
    if (disabled || isUploading) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    devLog('storage', 'avatar-picker:permission', {
      granted: permission.granted,
      status: permission.status,
      canAskAgain: permission.canAskAgain,
    });

    if (!permission.granted) {
      onError?.('Necesitamos acceso a tu galería para cambiar la foto de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      devLog('storage', 'avatar-picker:cancelled');
      return;
    }

    const asset = result.assets[0];
    setLocalPreviewUri(asset.uri);
    devLog('storage', 'avatar-picker:selected', {
      uriScheme: asset.uri.split(':')[0],
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType ?? null,
      fileSize: asset.fileSize ?? null,
    });

    try {
      setIsUploading(true);
      const avatarUrl = await onUpload(asset.uri);
      devLog('storage', 'avatar-picker:upload-success', {
        urlPreview: avatarUrl.slice(0, 120),
      });
      onChange(avatarUrl);
      setLocalPreviewUri(null);
    } catch (error) {
      devError('storage', 'avatar-picker:upload-failed', error);
      setLocalPreviewUri(null);
      onError?.('No pudimos subir tu foto. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Elegir foto de perfil"
      disabled={disabled || isUploading}
      onPress={() => {
        void handlePickImage();
      }}
      style={[styles.wrapper, isOnboarding && styles.wrapperOnboarding]}>
      <View style={styles.avatarWrapper}>
        {displayImageUrl ? (
          <Avatar imageUrl={displayImageUrl} name={name} size={avatarSize} />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: theme.backgroundElement,
              },
            ]}>
            <AppIcon color={theme.textMuted} name="person-outline" size={isOnboarding ? 40 : 32} />
          </View>
        )}

        {isUploading ? (
          <View style={[styles.overlay, { backgroundColor: `${theme.text}55`, borderRadius: avatarSize / 2 }]}>
            <LoadingAnimation size={32} />
          </View>
        ) : null}

        {isOnboarding ? (
          <View
            style={[
              styles.addButton,
              {
                backgroundColor: theme.primary,
                borderColor: theme.background,
              },
            ]}>
            <AppIcon color={theme.primaryForeground} name="add" size={18} />
          </View>
        ) : null}
      </View>

      {!isOnboarding ? (
        <AppText color="primary" variant="caption">
          {isUploading ? 'Subiendo...' : 'Elegir foto'}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  wrapperOnboarding: {
    alignSelf: 'center',
    marginVertical: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
