import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';

type WorkShowcaseCardProps = {
  title: string;
  subtitle?: string;
  rating?: number;
  evidenceUrls: string[];
};

export function WorkShowcaseCard({
  title,
  subtitle,
  rating,
  evidenceUrls,
}: WorkShowcaseCardProps) {
  return (
    <View style={styles.container}>
      <AppText variant="bodyMedium">{title}</AppText>
      {subtitle ? (
        <AppText color="textSecondary" variant="caption">
          {subtitle}
        </AppText>
      ) : null}
      {typeof rating === 'number' ? (
        <AppText color="primary" variant="caption">
          {rating.toFixed(1)}★
        </AppText>
      ) : null}

      {evidenceUrls.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gallery}>
            {evidenceUrls.map((url) => (
              <Image key={url} contentFit="cover" source={{ uri: url }} style={styles.image} />
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  gallery: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: Radius.md,
  },
});
