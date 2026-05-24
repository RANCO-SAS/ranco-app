import { StyleSheet, View, type ViewProps } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type SectionProps = ViewProps & {
  title?: string;
  description?: string;
};

export function Section({ title, description, style, children, ...rest }: SectionProps) {
  return (
    <View style={[styles.section, style]} {...rest}>
      {title ? <AppText variant="subtitle">{title}</AppText> : null}
      {description ? (
        <AppText variant="caption" color="textSecondary">
          {description}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
});
