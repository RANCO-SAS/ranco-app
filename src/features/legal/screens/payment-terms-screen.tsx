import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout/stack-header';
import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import {
  CardGradients,
  Layout,
  NegotiationButtonGradients,
  Radius,
  Spacing,
  TermsScreenGradients,
} from '@/constants/theme';
import {
  PAYMENT_FEE_CARDS,
  PAYMENT_TERMS_INTRO,
  PAYMENT_TERMS_LAST_UPDATED,
  PAYMENT_TERMS_SECTIONS,
  type TermsBulletItem,
} from '@/features/legal/constants/payment-terms-content';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type TermsBulletListProps = {
  items: TermsBulletItem[];
  borderColor: string;
  cardBackground: string;
};

function TermsBulletList({ items, borderColor, cardBackground }: TermsBulletListProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
      {items.map((item, index) => (
        <View
          key={item.text}
          style={[
            styles.bulletRow,
            index < items.length - 1 ? { borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth } : null,
          ]}>
          {item.icon ? (
            <View style={[styles.bulletIcon, { backgroundColor: `${theme.primary}18` }]}>
              <AppIcon color={theme.primary} name={item.icon} size={16} />
            </View>
          ) : (
            <View style={styles.bulletDot} />
          )}
          <AppText color="textSecondary" style={styles.bulletText} variant="body">
            {item.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}

type TermsFeeCardsProps = {
  borderColor: string;
};

function TermsFeeCards({ borderColor }: TermsFeeCardsProps) {
  const theme = useTheme();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const cardGradients = CardGradients[colorScheme];

  return (
    <View style={styles.feeRow}>
      {PAYMENT_FEE_CARDS.map((card) => (
        <View key={card.label} style={[styles.feeCardShell, { borderColor }]}>
          <LinearGradient
            colors={cardGradients.surface}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.feeCard}>
            <LinearGradient
              colors={cardGradients.glow}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              style={styles.feeCardGlow}
            />
            <AppText color="textMuted" style={styles.feeLabel} variant="small">
              {card.label.toUpperCase()}
            </AppText>
            <AppText
              style={{ color: colorScheme === 'dark' ? '#FFFFFF' : theme.text }}
              variant="title">
              {card.value}
            </AppText>
            <AppText color="textMuted" variant="caption">
              {card.caption}
            </AppText>
          </LinearGradient>
        </View>
      ))}
    </View>
  );
}

export function PaymentTermsScreen() {
  const theme = useTheme();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const gradient = NegotiationButtonGradients[colorScheme];
  const screenGradient = TermsScreenGradients[colorScheme];
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;
  const cardBackground = theme.backgroundSecondary;
  const footerBackground = colorScheme === 'dark' ? '#000000' : theme.background;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={screenGradient}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <StackHeader applyTopInset title="Términos de pagos" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Layout.minTouchTarget + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}>
        <AppText color="textMuted" variant="caption">
          Última actualización: {PAYMENT_TERMS_LAST_UPDATED}
        </AppText>

        <AppText color="textSecondary" style={styles.intro} variant="body">
          {PAYMENT_TERMS_INTRO}
        </AppText>

        {PAYMENT_TERMS_SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <AppText style={{ color: theme.primary }} variant="bodyMedium">
              {section.title}
            </AppText>

            {section.paragraphs?.map((paragraph) => (
              <AppText key={paragraph} color="textSecondary" style={styles.paragraph} variant="body">
                {paragraph}
              </AppText>
            ))}

            {section.bullets ? (
              <TermsBulletList
                borderColor={borderColor}
                cardBackground={cardBackground}
                items={section.bullets}
              />
            ) : null}

            {section.feeCards ? <TermsFeeCards borderColor={borderColor} /> : null}
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: footerBackground,
            borderTopColor: borderColor,
            paddingBottom: Math.max(insets.bottom, Spacing.md),
          },
        ]}>
        <AnimatedPressable accessibilityRole="button" onPress={() => router.back()}>
          <LinearGradient
            colors={gradient.primary}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.cta}>
            <AppText style={{ color: gradient.primaryText, fontWeight: '700' }} variant="bodyMedium">
              Entendido
            </AppText>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
  },
  intro: {
    lineHeight: 22,
  },
  section: {
    gap: Spacing.sm,
  },
  paragraph: {
    lineHeight: 22,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  bulletIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: '#64748B',
    marginTop: 10,
    marginLeft: 4,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  feeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  feeCardShell: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  feeCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
    minHeight: 108,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  feeCardGlow: {
    ...StyleSheet.absoluteFill,
  },
  feeLabel: {
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.md,
  },
  cta: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
