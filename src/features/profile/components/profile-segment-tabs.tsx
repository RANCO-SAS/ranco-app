import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import type { PublicProfileTab } from '@/features/profile/types/profile.types';
import { useTheme } from '@/hooks/use-theme';

type ProfileSegmentTabsProps = {
  activeTab: PublicProfileTab;
  onChange: (tab: PublicProfileTab) => void;
  variant?: 'pill' | 'underline' | 'embedded';
};

const TABS: Array<{ value: PublicProfileTab; label: string }> = [
  { value: 'summary', label: 'Resumen' },
  { value: 'reviews', label: 'Reseñas' },
  { value: 'jobs', label: 'Trabajos' },
];

export function ProfileSegmentTabs({
  activeTab,
  onChange,
  variant = 'pill',
}: ProfileSegmentTabsProps) {
  const theme = useTheme();

  if (variant === 'embedded') {
    return (
      <View style={[styles.embeddedTrack, { borderTopColor: theme.border }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <Pressable
              key={tab.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(tab.value)}
              style={styles.embeddedOption}>
              <AppText
                align="center"
                color={isActive ? 'primary' : 'textSecondary'}
                variant="bodyMedium">
                {tab.label}
              </AppText>
              {isActive ? (
                <View style={[styles.embeddedIndicator, { backgroundColor: theme.primary }]} />
              ) : (
                <View style={styles.embeddedSpacer} />
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (variant === 'underline') {
    return (
      <View style={[styles.underlineTrack, { borderTopColor: theme.border }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <Pressable
              key={tab.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(tab.value)}
              style={styles.underlineOption}>
              <AppText
                align="center"
                color={isActive ? 'text' : 'textMuted'}
                variant="bodyMedium">
                {tab.label}
              </AppText>
              {isActive ? (
                <View style={[styles.underlineIndicator, { backgroundColor: theme.primary }]} />
              ) : (
                <View style={styles.underlineSpacer} />
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSecondary }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.value)}
            style={[styles.option, isActive && { backgroundColor: theme.text }]}>
            <AppText align="center" color={isActive ? 'background' : 'text'} variant="bodyMedium">
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  option: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  underlineTrack: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
  underlineOption: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  underlineIndicator: {
    height: 3,
    width: '55%',
    borderRadius: Radius.full,
  },
  underlineSpacer: {
    height: 3,
  },
  embeddedTrack: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
  embeddedOption: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  embeddedIndicator: {
    height: 3,
    width: '55%',
    borderRadius: Radius.full,
  },
  embeddedSpacer: {
    height: 3,
  },
});
