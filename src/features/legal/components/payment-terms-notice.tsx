import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Routes } from '@/constants/routes';
import { Radius, Spacing } from '@/constants/theme';
import { PAYMENT_TERMS_NEGOTIATION_SUMMARY } from '@/features/legal/constants/payment-terms-content';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type PaymentTermsNoticeProps = {
  onOpenTerms?: () => void;
  compact?: boolean;
};

export function PaymentTermsNotice({ onOpenTerms, compact = false }: PaymentTermsNoticeProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;

  const handleOpenTerms = () => {
    onOpenTerms?.();
    router.push(Routes.app.paymentTerms);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderColor,
        },
      ]}>
      <AppIcon color={theme.primary} name="shield-checkmark-outline" size={18} />
      <View style={styles.copy}>
        <AppText color="textSecondary" style={styles.summary} variant={compact ? 'small' : 'caption'}>
          {PAYMENT_TERMS_NEGOTIATION_SUMMARY}
        </AppText>
        <Pressable accessibilityRole="link" hitSlop={8} onPress={handleOpenTerms}>
          <AppText color="primary" style={styles.link} variant="caption">
            Ver términos de pagos
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  copy: {
    flex: 1,
    gap: Spacing.xs,
  },
  summary: {
    lineHeight: 18,
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
