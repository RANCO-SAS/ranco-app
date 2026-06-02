import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type OnboardingStepHeaderProps = {
  title: string;
  subtitle?: string;
};

export function OnboardingStepHeader({ title, subtitle }: OnboardingStepHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title">{title}</AppText>
      {subtitle ? (
        <AppText color="textSecondary" variant="body">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
});
