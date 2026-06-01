import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OpportunityLocationSectionProps = {
  locationLabel: string;
};

export function OpportunityLocationSection({ locationLabel }: OpportunityLocationSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <AppText color="textSecondary" variant="body">
        {locationLabel}
      </AppText>

      <View style={[styles.mapPreview, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
        <View style={[styles.mapGridLine, styles.mapGridHorizontal, { backgroundColor: theme.border }]} />
        <View style={[styles.mapGridLine, styles.mapGridVertical, { backgroundColor: theme.border }]} />
        <View style={[styles.pin, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <AppIcon color={theme.primary} name="location" size={18} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
  mapPreview: {
    height: 140,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapGridLine: {
    position: 'absolute',
    opacity: 0.45,
  },
  mapGridHorizontal: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    top: '50%',
  },
  mapGridVertical: {
    height: '100%',
    width: StyleSheet.hairlineWidth,
    left: '50%',
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
