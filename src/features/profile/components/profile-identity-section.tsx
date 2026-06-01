import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfileIdentitySectionProps = {
  fullName: string;
  avatarUrl?: string | null;
  locationLabel?: string | null;
  onEditPhotoPress: () => void;
};

export function ProfileIdentitySection({
  fullName,
  avatarUrl,
  locationLabel,
  onEditPhotoPress,
}: ProfileIdentitySectionProps) {
  const theme = useTheme();
  const displayName = fullName || 'Usuario';

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Avatar
          imageUrl={avatarUrl}
          name={displayName}
          previewTitle={displayName}
          previewable={Boolean(avatarUrl)}
          size={112}
        />
        <Pressable
          accessibilityLabel="Editar foto de perfil"
          accessibilityRole="button"
          hitSlop={Spacing.sm}
          onPress={onEditPhotoPress}
          style={[
            styles.editPhotoButton,
            {
              backgroundColor: theme.primary,
              borderColor: theme.background,
            },
          ]}>
          <AppIcon color={theme.primaryForeground} name="camera-outline" size={16} />
        </Pressable>
      </View>

      <AppText align="center" variant="title">
        {displayName}
      </AppText>

      {locationLabel ? (
        <View style={styles.locationRow}>
          <AppIcon color={theme.textMuted} name="location-outline" size={16} />
          <AppText align="center" color="textSecondary" numberOfLines={2} variant="body">
            {locationLabel}
          </AppText>
        </View>
      ) : (
        <AppText align="center" color="textMuted" variant="caption">
          Ubicación no configurada
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  editPhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    maxWidth: '100%',
  },
});
