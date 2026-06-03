import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OnboardingProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export function OnboardingProgressBar({ currentStep, totalSteps }: OnboardingProgressBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <AppText color="primary" style={styles.stepLabel} variant="caption">
        Paso {currentStep + 1} de {totalSteps}
      </AppText>

      <View style={styles.segments}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor:
                  index <= currentStep ? theme.primary : theme.backgroundElement,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
  stepLabel: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  segments: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: Radius.full,
  },
});
