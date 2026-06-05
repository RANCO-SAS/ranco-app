import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated-pressable';
import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import {
  Layout,
  NegotiationButtonGradients,
  NegotiationButtonSurfaces,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type CancelServiceRequestModalProps = {
  visible: boolean;
  categoryName: string;
  title: string;
  isPending?: boolean;
  onKeep: () => void;
  onConfirmCancel: () => void;
};

export function CancelServiceRequestModal({
  visible,
  categoryName,
  title,
  isPending = false,
  onKeep,
  onConfirmCancel,
}: CancelServiceRequestModalProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const gradient = NegotiationButtonGradients[colorScheme];
  const destructiveSurface = NegotiationButtonSurfaces[colorScheme].mutedDestructive;
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border;

  return (
    <Modal animationType="fade" onRequestClose={onKeep} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor,
            },
          ]}>
          <View style={[styles.warningIcon, { backgroundColor: destructiveSurface.background }]}>
            <AppIcon color={destructiveSurface.text} name="warning-outline" size={28} />
          </View>

          <AppText align="center" variant="title">
            ¿Cancelar solicitud?
          </AppText>

          <AppText align="center" color="textSecondary" style={styles.description} variant="body">
            Si cancelas esta solicitud, ya no podrás recibir ofertas de profesionales para este
            trabajo y la publicación se eliminará del feed.
          </AppText>

          <View
            style={[
              styles.contextCard,
              { backgroundColor: theme.backgroundElement, borderColor },
            ]}>
            <View style={[styles.contextIcon, { backgroundColor: `${theme.primary}20` }]}>
              <AppIcon color={theme.primary} name="construct-outline" size={18} />
            </View>
            <View style={styles.contextCopy}>
              <AppText numberOfLines={1} variant="bodyMedium">
                {categoryName}
              </AppText>
              <AppText color="textSecondary" numberOfLines={2} variant="caption">
                {title}
              </AppText>
            </View>
          </View>

          <AnimatedPressable
            accessibilityRole="button"
            disabled={isPending}
            onPress={onKeep}
            style={[styles.primaryShell, { opacity: isPending ? 0.6 : 1 }]}>
            <LinearGradient
              colors={[...gradient.primary]}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={styles.primaryAction}>
              <AppText style={[styles.primaryActionLabel, { color: gradient.primaryText }]} variant="bodyMedium">
                Mantener solicitud
              </AppText>
            </LinearGradient>
          </AnimatedPressable>

          <Pressable
            accessibilityRole="button"
            disabled={isPending}
            hitSlop={8}
            onPress={onConfirmCancel}
            style={styles.destructiveLink}>
            <AppText style={{ color: destructiveSurface.text, fontWeight: '600' }} variant="bodyMedium">
              {isPending ? 'Cancelando...' : 'Sí, cancelar'}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
  dialog: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  warningIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    lineHeight: 22,
  },
  contextCard: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contextIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  primaryShell: {
    alignSelf: 'stretch',
    marginTop: Spacing.xs,
  },
  primaryAction: {
    minHeight: Layout.minTouchTarget + 4,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionLabel: {
    fontWeight: '700',
  },
  destructiveLink: {
    paddingVertical: Spacing.sm,
  },
});
