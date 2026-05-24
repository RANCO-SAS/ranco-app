import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RoleOption = 'client' | 'professional';

type RoleSelectorProps = {
  isClient: boolean;
  isProfessional: boolean;
  onToggleClient: () => void;
  onToggleProfessional: () => void;
  onActivateProfessional?: () => void;
  error?: string;
  disabled?: boolean;
};

function canDisableRole(props: RoleSelectorProps, role: RoleOption): boolean {
  if (role === 'client') {
    return props.isClient && props.isProfessional;
  }

  return props.isProfessional && props.isClient;
}

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
    description: 'Pedir y publicar servicios',
    isSelected: (props) => props.isClient,
    onToggle: (props) => props.onToggleClient,
  },
  {
    key: 'professional',
    title: 'Profesional',
    description: 'Ofrecer servicios y ver oportunidades',
    isSelected: (props) => props.isProfessional,
    onToggle: (props) => props.onToggleProfessional,
  },
];

export function RoleSelector(props: RoleSelectorProps) {
  const theme = useTheme();
  const { error, disabled } = props;

  return (
    <View style={styles.wrapper}>
      <AppText color="textMuted" variant="small">
        TUS ROLES EN RANCO
      </AppText>
      <AppText color="textSecondary" variant="caption">
        Puedes activar uno o ambos. Necesitas al menos uno activo.
      </AppText>

      <View style={styles.options}>
        {ROLE_OPTIONS.map((option) => {
          const selected = option.isSelected(props);
          const canDisable = canDisableRole(props, option.key);
          const isLocked = selected && !canDisable;

          return (
            <Pressable
              key={option.key}
              accessibilityRole="switch"
              accessibilityState={{ checked: selected, disabled: disabled || isLocked }}
              disabled={disabled || isLocked}
              onPress={() => {
                if (disabled) {
                  return;
                }

                if (selected && !canDisable) {
                  return;
                }

                if (option.key === 'professional' && !selected && props.onActivateProfessional) {
                  props.onActivateProfessional();
                  return;
                }

                option.onToggle(props);
              }}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? theme.text : theme.backgroundSecondary,
                  borderColor: selected ? theme.text : theme.border,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}>
              <View style={styles.optionHeader}>
                <AppText color={selected ? 'background' : 'text'} variant="bodyMedium">
                  {option.title}
                </AppText>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: selected ? theme.background : theme.backgroundElement,
                    },
                  ]}>
                  <AppText color={selected ? 'text' : 'textMuted'} variant="small">
                    {selected ? 'Activo' : 'Inactivo'}
                  </AppText>
                </View>
              </View>
              <AppText color={selected ? 'background' : 'textSecondary'} variant="caption">
                {option.description}
              </AppText>
              {isLocked ? (
                <AppText color={selected ? 'background' : 'textMuted'} variant="small">
                  Debes mantener al menos un rol activo
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {props.isClient && props.isProfessional ? (
        <Card>
          <AppText color="textSecondary" variant="caption">
            Tienes ambos roles. En Perfil podrás alternar entre modo cliente y modo profesional.
          </AppText>
        </Card>
      ) : null}

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
    gap: Spacing.md,
  },
  options: {
    gap: Spacing.sm,
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
