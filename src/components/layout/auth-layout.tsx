import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { fadeInDownEntrance } from '@/components/ui/staggered-fade-in';
import { Spacer } from '@/components/ui/spacer';
import { Spacing } from '@/constants/theme';

type AuthLayoutProps = ViewProps & {
  brand?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthLayout({
  brand,
  title,
  subtitle,
  children,
  style,
  ...rest
}: AuthLayoutProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <Animated.View
        entering={fadeInDownEntrance()}
        style={styles.header}>
        {brand ? (
          <AppText align="center" variant="display">
            {brand}
          </AppText>
        ) : null}
        {brand ? <Spacer size="lg" /> : null}
        <AppText align="center" variant="title">
          {title}
        </AppText>
        {subtitle ? (
          <>
            <Spacer size="sm" />
            <AppText align="center" color="textSecondary" variant="body">
              {subtitle}
            </AppText>
          </>
        ) : null}
      </Animated.View>

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
