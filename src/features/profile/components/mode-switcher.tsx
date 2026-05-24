import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { UserMode } from '@/types';

type ModeSwitcherProps = {
  activeMode: UserMode;
  compact?: boolean;
  onChange: (mode: UserMode) => void;
};

const MODES: Array<{ value: UserMode; label: string; hint: string }> = [
  { value: 'client', label: 'Cliente', hint: 'Pedir servicios' },
  { value: 'professional', label: 'Profesional', hint: 'Ver oportunidades' },
];

export function ModeSwitcher({ activeMode, compact = false, onChange }: ModeSwitcherProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {!compact ? (
        <AppText color="textMuted" variant="small">
          ELIGE CÓMO USAR RANCO
        </AppText>
      ) : null}
      <View style={[styles.track, { backgroundColor: theme.backgroundSecondary }]}>
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
                  backgroundColor: theme.text,
                },
              ]}>
              <AppText
                align="center"
                color={isActive ? 'background' : 'text'}
                variant="bodyMedium">
                {mode.label}
              </AppText>
              {!compact ? (
                <AppText
                  align="center"
                  color={isActive ? 'background' : 'textMuted'}
                  variant="small">
                  {mode.hint}
                </AppText>
              ) : null}
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
    borderRadius: Radius.lg,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  option: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
});
