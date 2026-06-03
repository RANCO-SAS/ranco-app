import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { useTheme } from '@/hooks/use-theme';

type ReviewStarRatingProps = {
  rating: number;
  size?: number;
};

export function ReviewStarRating({ rating, size = 14 }: ReviewStarRatingProps) {
  const theme = useTheme();
  const filledCount = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }, (_, index) => (
        <AppIcon
          color={index < filledCount ? theme.warning : theme.backgroundElement}
          key={index}
          name="star"
          size={size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
