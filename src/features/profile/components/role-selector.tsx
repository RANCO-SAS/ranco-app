import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RoleOption = 'client' | 'professional';

type RoleSelectorProps = {
  isClient: boolean;
  isProfessional: boolean;
  onToggleClient: () => void;
  onToggleProfessional: () => void;
  error?: string;
  disabled?: boolean;
};

const ROLE_OPTIONS: Array<{
  key: RoleOption;
  title: string;
  description: string;
  isSelected: (props: RoleSelectorProps) => boolean;
  onToggle: (props: RoleSelectorProps) => void;
}> = [
  {
    key: 'client',
    title: 'Cliente',
    description: 'Busco contratar servicios cerca de mí',
    isSelected: (props) => props.isClient,
    onToggle: (props) => props.onToggleClient,
  },
  {
    key: 'professional',
    title: 'Profesional',
    description: 'Quiero ofrecer mis servicios',
    isSelected: (props) => props.isProfessional,
    onToggle: (props) => props.onToggleProfessional,
  },
];

export function RoleSelector(props: RoleSelectorProps) {
  const theme = useTheme();
  const { error, disabled } = props;

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">
        ¿Cómo quieres usar Ranco?
      </AppText>

      <View style={styles.options}>
        {ROLE_OPTIONS.map((option) => {
          const selected = option.isSelected(props);

          return (
            <Pressable
              key={option.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => option.onToggle(props)}
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

      {error ? (
        <AppText variant="small" color="destructive">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
});
