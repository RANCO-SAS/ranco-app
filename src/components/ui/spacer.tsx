import { View, type ViewProps } from 'react-native';

import { Spacing } from '@/constants/theme';

type SpacerProps = ViewProps & {
  size?: keyof typeof Spacing;
  horizontal?: boolean;
};

export function Spacer({ size = 'lg', horizontal = false, style, ...rest }: SpacerProps) {
  const value = Spacing[size];

  return (
    <View
      style={[{ width: horizontal ? value : undefined, height: horizontal ? undefined : value }, style]}
      {...rest}
    />
  );
}
