import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { BrandGradients, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type GradientPromoCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
};

export function GradientPromoCard({
  title,
  description,
  actionLabel,
  onPress,
}: GradientPromoCardProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? BrandGradients.dark : BrandGradients.light;

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <LinearGradient
        colors={[...colors]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.card}>
        <View style={styles.content}>
          <AppText style={styles.title} variant="subtitle">
            {title}
          </AppText>
          <AppText style={styles.description} variant="caption">
            {description}
          </AppText>
          <View style={styles.actionPill}>
            <AppText style={styles.actionLabel} variant="caption">
              {actionLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.iconWrap}>
          <AppIcon color="rgba(255,255,255,0.85)" name="rocket-outline" size={42} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 148,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255,255,255,0.88)',
  },
  actionPill: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconWrap: {
    opacity: 0.9,
  },
});
