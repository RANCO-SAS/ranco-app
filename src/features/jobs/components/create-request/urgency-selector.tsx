import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { ServiceRequestUrgency } from '@/features/jobs/types/service-request.types';
import { useTheme } from '@/hooks/use-theme';

const URGENCY_OPTIONS: Array<{
  value: ServiceRequestUrgency;
  label: string;
  eta: string;
}> = [
  { value: 'low', label: 'Flexible', eta: 'Cuando haya cupo' },
  { value: 'normal', label: 'Normal', eta: '1-3 días' },
  { value: 'high', label: 'Pronto', eta: 'Esta semana' },
  { value: 'urgent', label: 'Urgente', eta: 'Lo antes posible' },
];

type UrgencySelectorProps = {
  value: ServiceRequestUrgency;
  onChange: (value: ServiceRequestUrgency) => void;
  error?: string;
  disabled?: boolean;
};

export function UrgencySelector({ value, onChange, error, disabled }: UrgencySelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <AppText color="textMuted" variant="small">
        ELIGE CUÁNDO LO NECESITAS
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {URGENCY_OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? theme.text : theme.backgroundSecondary,
                  borderColor: selected ? theme.text : theme.border,
                },
              ]}>
              <AppText color={selected ? 'background' : 'text'} variant="bodyMedium">
                {option.label}
              </AppText>
              <AppText color={selected ? 'background' : 'textMuted'} variant="small">
                {option.eta}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? (
        <AppText color="destructive" variant="small">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  row: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  option: {
    minWidth: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
});
