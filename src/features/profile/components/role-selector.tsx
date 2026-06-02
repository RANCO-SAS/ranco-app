import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
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
  description: string;
  icon: AppIconName;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    key: 'client',
    icon: 'search-outline',
    title: 'Busco servicios',
    description: 'Quiero encontrar y contratar profesionales de confianza para mis necesidades.',
  },
  {
    key: 'professional',
    icon: 'storefront-outline',
    title: 'Ofrezco servicios',
    description: 'Soy un profesional y quiero ofrecer mis servicios a la comunidad Ranco.',
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
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: selected ? theme.primary : theme.border,
                  opacity: disabled ? 0.6 : pressed ? 0.92 : 1,
                },
              ]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.backgroundElement }]}>
                <AppIcon color={theme.text} name={option.icon} size={22} />
              </View>

              <View style={styles.copy}>
                <AppText variant="bodyMedium">{option.title}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {option.description}
                </AppText>
              </View>

              <View
                style={[
                  styles.radio,
                  {
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}>
                {selected ? <View style={[styles.radioFill, { backgroundColor: theme.primary }]} /> : null}
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
    gap: Spacing.md,
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
  },
});
