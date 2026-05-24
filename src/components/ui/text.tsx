import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'bodyMedium' | 'caption' | 'label' | 'small';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: ThemeColor;
  align?: TextStyle['textAlign'];
};

const variantStyles: Record<TextVariant, TextStyle> = Typography;

export function AppText({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[variantStyles[variant], { color: theme[color], textAlign: align }, style]}
      {...rest}
    />
  );
}

export const textStyles = StyleSheet.create({});
