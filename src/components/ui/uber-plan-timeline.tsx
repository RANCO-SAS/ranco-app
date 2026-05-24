import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type UberPlanStep = {
  label: string;
  value?: string;
  completed: boolean;
  active: boolean;
};

type UberPlanTimelineProps = {
  steps: UberPlanStep[];
};

export function UberPlanTimeline({ steps }: UberPlanTimelineProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <View key={step.label} style={styles.stepRow}>
            <View style={styles.timeline}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: step.completed || step.active ? theme.text : theme.border,
                  },
                ]}
              />
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: step.completed ? theme.text : theme.border,
                    },
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.stepContent}>
              <AppText color="textMuted" variant="small">
                {step.label}
              </AppText>
              <AppText variant={step.active ? 'bodyMedium' : 'body'} color={step.value ? 'text' : 'textMuted'}>
                {step.value ?? 'Pendiente'}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeline: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
});
