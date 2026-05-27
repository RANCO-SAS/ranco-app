import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { PublicProfileTab } from '@/features/profile/types/profile.types';
import { useTheme } from '@/hooks/use-theme';

type ProfileSegmentTabsProps = {
  activeTab: PublicProfileTab;
  onChange: (tab: PublicProfileTab) => void;
};

const TABS: Array<{ value: PublicProfileTab; label: string }> = [
  { value: 'summary', label: 'Resumen' },
  { value: 'reviews', label: 'Reseñas' },
  { value: 'jobs', label: 'Trabajos' },
];

export function ProfileSegmentTabs({ activeTab, onChange }: ProfileSegmentTabsProps) {
  const theme = useTheme();

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
            style={[
              styles.option,
              isActive && { backgroundColor: theme.text },
            ]}>
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
});
