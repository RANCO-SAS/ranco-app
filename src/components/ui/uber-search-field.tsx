import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type UberSearchFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  onPress?: () => void;
  editable?: boolean;
  showSearchIcon?: boolean;
};

export function UberSearchField({
  label,
  onPress,
  editable = true,
  showSearchIcon = true,
  placeholder,
  value,
  ...rest
}: UberSearchFieldProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}>
      {showSearchIcon ? (
        <AppText color="textMuted" style={styles.searchIcon} variant="body">
          ⌕
        </AppText>
      ) : null}
      {editable ? (
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text }]}
          value={value}
          {...rest}
        />
      ) : (
        <AppText color={value ? 'text' : 'textMuted'} style={styles.placeholder} variant="bodyMedium">
          {value || placeholder}
        </AppText>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText color="textSecondary" variant="label">
          {label}
        </AppText>
      ) : null}
      {onPress && !editable ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  container: {
    minHeight: Layout.minTouchTarget + 12,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  searchIcon: {
    fontSize: 22,
    lineHeight: 24,
  },
  input: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    paddingVertical: Spacing.md,
  },
  placeholder: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
});
