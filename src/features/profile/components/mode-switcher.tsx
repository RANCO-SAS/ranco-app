import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { UserMode } from '@/types';

type ModeSwitcherProps = {
  activeMode: UserMode;
  onChange: (mode: UserMode) => void;
};

const MODES: Array<{ value: UserMode; label: string }> = [
  { value: 'client', label: 'Cliente' },
  { value: 'professional', label: 'Profesional' },
];

export function ModeSwitcher({ activeMode, onChange }: ModeSwitcherProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        Modo activo
      </AppText>
      <View style={[styles.track, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {MODES.map((mode) => {
          const isActive = activeMode === mode.value;

          return (
            <Pressable
              key={mode.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(mode.value)}
              style={[
                styles.option,
                isActive && {
                  backgroundColor: theme.primary,
                },
              ]}>
              <AppText
                variant="bodyMedium"
                color={isActive ? 'primaryForeground' : 'textSecondary'}
                align="center">
                {mode.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  track: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  option: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
});
