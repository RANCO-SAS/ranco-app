import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacer } from '@/components/ui/spacer';
import { Spacing } from '@/constants/theme';

type AuthLayoutProps = ViewProps & {
  title: string;
  subtitle?: string;
};

export function AuthLayout({ title, subtitle, children, style, ...rest }: AuthLayoutProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <View style={styles.header}>
        <AppText variant="display">{title}</AppText>
        {subtitle ? (
          <>
            <Spacer size="sm" />
            <AppText variant="body" color="textSecondary">
              {subtitle}
            </AppText>
          </>
        ) : null}
      </View>

      <Spacer size="xxl" />

      <View style={styles.form}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.sm,
  },
  form: {
    gap: Spacing.lg,
  },
});
