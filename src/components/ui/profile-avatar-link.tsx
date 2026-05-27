import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Routes } from '@/constants/routes';

type ProfileAvatarLinkProps = {
  userId: string;
  name: string;
  imageUrl?: string | null;
  size?: number;
  view?: 'client' | 'professional';
  disabled?: boolean;
};

export function ProfileAvatarLink({
  userId,
  name,
  imageUrl,
  size = 44,
  view,
  disabled = false,
}: ProfileAvatarLinkProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(Routes.app.userProfile(userId, view));
  };

  return (
    <Pressable
      accessibilityLabel={`Ver perfil de ${name}`}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={(event) => {
        event.stopPropagation();
        handlePress();
      }}
      style={({ pressed }) => [pressed && !disabled ? styles.pressed : null]}>
      <Avatar imageUrl={imageUrl} name={name} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
});
