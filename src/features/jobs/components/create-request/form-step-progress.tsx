import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormStep = {
  label: string;
};

type FormStepProgressProps = {
  steps: FormStep[];
  currentStep: number;
};

export function FormStepProgress({ steps, currentStep }: FormStepProgressProps) {
  const theme = useTheme();
  const progress = (currentStep + 1) / steps.length;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <AppText variant="caption" color="textMuted">
          Paso {currentStep + 1} de {steps.length}
        </AppText>
        <AppText variant="bodyMedium">{steps[currentStep]?.label}</AppText>
      </View>

      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.primary,
              width: `${Math.max(progress * 100, 8)}%`,
            },
          ]}
        />
      </View>

      <View style={styles.labels}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <View key={step.label} style={styles.labelItem}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive || isCompleted ? theme.primary : theme.border,
                  },
                ]}
              />
              <AppText
                color={isActive ? 'text' : 'textMuted'}
                variant="small">
                {step.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  labelItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
});
