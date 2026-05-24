import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

type UseKeyboardLayoutOptions = {
  extraOffset?: number;
};

export function useKeyboardLayout(options?: UseKeyboardLayoutOptions) {
  const insets = useSafeAreaInsets();
  const extraOffset = options?.extraOffset ?? 0;

  return {
    insets,
    keyboardVerticalOffset: Platform.OS === 'ios' ? insets.top + extraOffset : extraOffset,
    keyboardBehavior: Platform.select({
      ios: 'padding' as const,
      android: 'padding' as const,
      default: 'padding' as const,
    }),
    contentPaddingBottom: Math.max(insets.bottom, Spacing.lg),
  };
}
