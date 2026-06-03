import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CreateRequestProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export function CreateRequestProgressBar({
  currentStep,
  totalSteps,
}: CreateRequestProgressBarProps) {
  const theme = useTheme();
  const progress = Math.min((currentStep + 1) / totalSteps, 1);

  return (
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
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
