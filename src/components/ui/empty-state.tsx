import { View, type ViewProps } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

type EmptyStateProps = ViewProps & {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onActionPress,
  style,
  ...rest
}: EmptyStateProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.md,
          padding: Spacing.xxxl,
        },
        style,
      ]}
      {...rest}>
      <AppText variant="subtitle" align="center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color="textSecondary" align="center">
          {description}
        </AppText>
      ) : null}
      {actionLabel && onActionPress ? (
        <Button label={actionLabel} onPress={onActionPress} fullWidth={false} />
      ) : null}
    </View>
  );
}
