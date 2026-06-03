import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { ClientRequestTab } from '@/features/jobs/utils/group-client-service-requests';
import { useTheme } from '@/hooks/use-theme';

type ClientRequestTabsProps = {
  activeTab: ClientRequestTab;
  onChange: (tab: ClientRequestTab) => void;
  counts: Record<ClientRequestTab, number>;
};

const TABS: Array<{ value: ClientRequestTab; label: string }> = [
  { value: 'active', label: 'Activas' },
  { value: 'scheduled', label: 'Programadas' },
  { value: 'history', label: 'Historial' },
];

export function ClientRequestTabs({ activeTab, onChange, counts }: ClientRequestTabsProps) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { borderBottomColor: theme.border }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        const count = counts[tab.value];

        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.value)}
            style={styles.option}>
            <AppText align="center" color={isActive ? 'text' : 'textMuted'} variant="bodyMedium">
              {tab.label}
              {count > 0 ? ` (${count})` : ''}
            </AppText>
            {isActive ? (
              <View style={[styles.indicator, { backgroundColor: theme.primary }]} />
            ) : (
              <View style={styles.indicatorSpacer} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  indicator: {
    height: 3,
    width: '50%',
    borderRadius: 999,
  },
  indicatorSpacer: {
    height: 3,
  },
});
