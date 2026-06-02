import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { AppIcon } from '@/components/ui/app-icon';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { CategoryIcon } from '@/components/ui/category-icon';
import {
  getRequestAssignmentFooter,
  getRequestStatusBadge,
} from '@/features/jobs/utils/client-request-card-meta';
import { formatServiceRequestTimestamp } from '@/features/jobs/utils/format-service-request-time';
import type { ServiceRequest } from '@/features/jobs/types/service-request.types';
import { getBadgeToneColors } from '@/shared/utils/badge-colors';
import { useTheme } from '@/hooks/use-theme';

type ClientServiceRequestCardProps = {
  request: ServiceRequest;
  onPress?: () => void;
};

export function ClientServiceRequestCard({ request, onPress }: ClientServiceRequestCardProps) {
  const theme = useTheme();
  const statusBadge = getRequestStatusBadge(request);
  const statusColors = getBadgeToneColors(theme, statusBadge.tone);
  const timestamp = formatServiceRequestTimestamp(request);
  const assignmentFooter = getRequestAssignmentFooter(request);
  const headline = request.title.trim() || request.subcategoryName;
  const description = request.description.trim();
  const categorySlug = request.categorySlug ?? 'other';

  const card = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.backgroundElement }]}>
          <CategoryIcon slug={categorySlug} size={22} />
        </View>

        <View style={styles.headerText}>
          <AppText numberOfLines={1} variant="bodyMedium">
            {headline}
          </AppText>
          <AppText color="textSecondary" numberOfLines={1} variant="caption">
            {request.subcategoryName}
          </AppText>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColors.background }]}>
          {statusBadge.showDot ? (
            <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
          ) : null}
          <AppText style={{ color: statusColors.text }} variant="small">
            {statusBadge.label}
          </AppText>
        </View>
      </View>

      {description.length > 0 ? (
        <AppText color="textSecondary" numberOfLines={2} variant="body">
          {description}
        </AppText>
      ) : null}

      {request.locationLabel ? (
        <View style={styles.locationRow}>
          <AppIcon color={theme.textMuted} name="location-outline" size={14} />
          <AppText color="textMuted" numberOfLines={1} variant="small">
            {request.locationLabel}
          </AppText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.timestampRow}>
          <AppIcon color={theme.textMuted} name={timestamp.icon} size={14} />
          <AppText color="textMuted" variant="small">
            {timestamp.label}
          </AppText>
        </View>

        {assignmentFooter?.type === 'searching' ? (
          <View style={[styles.searchingPill, { borderColor: `${theme.primary}55` }]}>
            <LoadingAnimation size={18} />
            <AppText color="primary" variant="small">
              {assignmentFooter.label}
            </AppText>
          </View>
        ) : assignmentFooter?.type === 'professional' ? (
          <View style={styles.professionalRow}>
            <Avatar
              imageUrl={assignmentFooter.avatarUrl}
              name={assignmentFooter.fullName}
              size={24}
            />
            <AppText color="textSecondary" numberOfLines={1} variant="small">
              {assignmentFooter.label}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return card;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    maxWidth: '42%',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  searchingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    maxWidth: '58%',
  },
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
    maxWidth: '58%',
  },
  pressed: {
    opacity: 0.92,
  },
});
