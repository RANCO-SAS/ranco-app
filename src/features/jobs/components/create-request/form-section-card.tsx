import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type FormSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSectionCard({ title, description, children }: FormSectionCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="bodyMedium">{title}</AppText>
        {description ? (
          <AppText color="textSecondary" variant="caption">
            {description}
          </AppText>
        ) : null}
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
});
