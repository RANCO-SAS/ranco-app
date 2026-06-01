import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DetailSectionProps = {
  icon: AppIconName;
  title: string;
  children: ReactNode;
};

export function DetailSection({ icon, title, children }: DetailSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppIcon color={theme.primary} name={icon} size={18} />
        <AppText color="primary" variant="bodyMedium">
          {title}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
