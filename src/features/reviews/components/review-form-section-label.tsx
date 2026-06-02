import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/text';

type ReviewFormSectionLabelProps = {
  children: string;
};

export function ReviewFormSectionLabel({ children }: ReviewFormSectionLabelProps) {
  return (
    <AppText color="textMuted" style={styles.label} variant="caption">
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
