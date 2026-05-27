import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RoleSelection = {
  isClient: boolean;
  isProfessional: boolean;
};

type RoleSelectorProps = {
  isClient: boolean;
  isProfessional: boolean;
  onChange: (selection: RoleSelection) => void;
  error?: string;
  disabled?: boolean;
};

type RoleOption = {
  key: 'client' | 'professional';
  title: string;
  emoji: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: 'client',
    emoji: '🏠',
    title: 'Busco servicios',
  },
  {
    key: 'professional',
    emoji: '🛠️',
    title: 'Ofrezco servicios',
  },
];

function isSelected(selection: RoleSelection, key: RoleOption['key']): boolean {
  return key === 'client' ? selection.isClient : selection.isProfessional;
}

function toggleRole(selection: RoleSelection, key: RoleOption['key']): RoleSelection | null {
  const nextClient = key === 'client' ? !selection.isClient : selection.isClient;
  const nextProfessional =
    key === 'professional' ? !selection.isProfessional : selection.isProfessional;

  if (!nextClient && !nextProfessional) {
    return null;
  }

  return {
    isClient: nextClient,
    isProfessional: nextProfessional,
  };
}

export function RoleSelector({
  isClient,
  isProfessional,
  onChange,
  error,
  disabled = false,
}: RoleSelectorProps) {
  const theme = useTheme();
  const selection = { isClient, isProfessional };

  return (
    <View style={styles.wrapper}>
      <AppText variant="subtitle">¿Cómo quieres usar Ranco?</AppText>

      <View style={styles.options}>
        {ROLE_OPTIONS.map((option) => {
          const selected = isSelected(selection, option.key);

          return (
            <Pressable
              key={option.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => {
                const nextSelection = toggleRole(selection, option.key);

                if (!nextSelection) {
                  return;
                }

                onChange(nextSelection);
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? `${theme.primary}12` : theme.background,
                  borderColor: selected ? theme.primary : theme.border,
                  opacity: disabled ? 0.6 : pressed ? 0.92 : 1,
                },
              ]}>
              <View style={styles.optionHeader}>
                <View style={styles.titleRow}>
                  <AppText style={styles.emoji}>{option.emoji}</AppText>
                  <AppText variant="bodyMedium">{option.title}</AppText>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: selected ? theme.primary : theme.border,
                      backgroundColor: selected ? theme.primary : theme.background,
                    },
                  ]}>
                  {selected ? (
                    <AppText color="background" variant="small">
                      ✓
                    </AppText>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

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
    gap: Spacing.lg,
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    borderWidth: 2,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
