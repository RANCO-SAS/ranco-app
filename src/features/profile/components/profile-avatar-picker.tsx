import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { devError, devLog } from '@/lib/dev-logger';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfileAvatarPickerProps = {
  name: string;
  value?: string | null;
  disabled?: boolean;
  onChange: (avatarUrl: string) => void;
  onError?: (message: string) => void;
  onUpload: (uri: string) => Promise<string>;
};

export function ProfileAvatarPicker({
  name,
  value,
  disabled,
  onChange,
  onError,
  onUpload,
}: ProfileAvatarPickerProps) {
  const theme = useTheme();
  const [isUploading, setIsUploading] = useState(false);

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
    });

    if (result.canceled || !result.assets[0]) {
      devLog('storage', 'avatar-picker:cancelled');
      return;
    }

    const asset = result.assets[0];
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
    } catch (error) {
      devError('storage', 'avatar-picker:upload-failed', error);
      onError?.('No pudimos subir tu foto. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isUploading}
      onPress={() => {
        void handlePickImage();
      }}
      style={styles.wrapper}>
      <View style={styles.avatarWrapper}>
        <Avatar imageUrl={value} name={name} size={88} />
        {isUploading ? (
          <View style={[styles.overlay, { backgroundColor: `${theme.text}55` }]}>
            <ActivityIndicator color={theme.background} />
          </View>
        ) : null}
      </View>
      <AppText color="primary" variant="caption">
        {isUploading ? 'Subiendo foto...' : 'Elegir foto de perfil'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
});
