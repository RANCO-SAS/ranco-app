import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { ProBadge } from '@/features/subscriptions/components/pro-badge';
import { ProfileSegmentTabs } from '@/features/profile/components/profile-segment-tabs';
import type { PublicProfileTab } from '@/features/profile/types/profile.types';
import type { RoleReviewSummary } from '@/features/reviews/types/review.types';
import { useTheme } from '@/hooks/use-theme';

type PublicProfileHeroProps = {
  title: string;
  fullName: string;
  avatarUrl?: string | null;
  locationLabel?: string | null;
  primaryRole: 'client' | 'professional';
  professionLabel?: string;
  roleSummary: RoleReviewSummary | null;
  isPro?: boolean;
  activeTab: PublicProfileTab;
  onTabChange: (tab: PublicProfileTab) => void;
};

const AVATAR_SIZE = 104;

export function PublicProfileHero({
  title,
  fullName,
  avatarUrl,
  locationLabel,
  primaryRole,
  professionLabel,
  roleSummary,
  isPro = false,
  activeTab,
  onTabChange,
}: PublicProfileHeroProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const displayName = fullName || 'Usuario';
  const showVerifiedBadge =
    primaryRole === 'professional' &&
    Boolean(roleSummary && roleSummary.totalReviews > 0);
  const roleText =
    primaryRole === 'professional'
      ? professionLabel ?? 'Profesional'
      : 'Cliente';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundSecondary,
          borderBottomColor: theme.border,
          paddingTop: insets.top,
        },
      ]}>
      <View style={styles.navRow}>
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={Spacing.sm}
          onPress={() => router.back()}
          style={styles.backButton}>
          <AppIcon color={theme.text} name="chevron-back" size={24} />
        </Pressable>

        <AppText numberOfLines={1} style={styles.navTitle} variant="bodyMedium">
          {title}
        </AppText>

        <View style={styles.navSpacer} />
      </View>

      <View style={styles.profileRow}>
        <View
          style={[
            styles.avatarRing,
            {
              borderColor: theme.border,
              backgroundColor: theme.background,
            },
          ]}>
          <Avatar
            imageUrl={avatarUrl}
            name={displayName}
            previewTitle={displayName}
            previewable={Boolean(avatarUrl)}
            size={AVATAR_SIZE}
          />
        </View>

        <View style={styles.infoColumn}>
          <AppText numberOfLines={2} variant="title">
            {displayName}
          </AppText>

          {locationLabel ? (
            <View style={styles.metaRow}>
              <AppIcon color={theme.textMuted} name="location-outline" size={16} />
              <AppText color="textSecondary" numberOfLines={2} style={styles.metaText} variant="caption">
                {locationLabel}
              </AppText>
            </View>
          ) : null}

          <View style={styles.roleRow}>
            <AppIcon
              color={theme.primary}
              name={primaryRole === 'professional' ? 'construct-outline' : 'person-outline'}
              size={16}
            />
            <AppText color="primary" numberOfLines={1} style={styles.roleText} variant="bodyMedium">
              {roleText}
            </AppText>
            {isPro ? <ProBadge size="sm" variant={primaryRole} /> : null}
            {showVerifiedBadge ? (
              <View style={[styles.verifiedBadge, { backgroundColor: theme.primary }]}>
                <AppIcon color={theme.primaryForeground} name="checkmark" size={12} />
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <ProfileSegmentTabs activeTab={activeTab} onChange={onTabChange} variant="embedded" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    overflow: 'hidden',
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPaddingHorizontal,
    minHeight: Layout.minTouchTarget,
  },
  backButton: {
    width: 40,
    minHeight: Layout.minTouchTarget,
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
  },
  navSpacer: {
    width: 40,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  avatarRing: {
    borderRadius: Radius.full,
    borderWidth: 2,
    padding: 2,
  },
  infoColumn: {
    flex: 1,
    gap: Spacing.sm,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  metaText: {
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  roleText: {
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
