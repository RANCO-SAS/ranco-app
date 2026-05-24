import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { UserMode } from '@/types';

type ModeOption = {
  mode: UserMode;
  title: string;
  description: string;
};

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'client',
    title: 'Cliente',
    description: 'Publicar solicitudes y contratar servicios',
  },
  {
    mode: 'professional',
    title: 'Profesional',
    description: 'Explorar oportunidades y contactar clientes',
  },
];

type ModeSelectorProps = {
  selectedMode: UserMode | null;
  onSelectMode: (mode: UserMode) => void;
  disabled?: boolean;
};

export function ModeSelector({ selectedMode, onSelectMode, disabled }: ModeSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {MODE_OPTIONS.map((option) => {
        const selected = selectedMode === option.mode;

        return (
          <Pressable
            key={option.mode}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            disabled={disabled}
            onPress={() => onSelectMode(option.mode)}
            style={[
              styles.option,
              {
                backgroundColor: selected ? `${theme.primary}12` : theme.backgroundSecondary,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}>
            <AppText variant="bodyMedium">{option.title}</AppText>
            <AppText variant="caption" color="textSecondary">
              {option.description}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
});
