import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Motion } from '@/constants/motion';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  pressScale?: number;
};

export function AnimatedPressable({
  children,
  disabled,
  onPressIn,
  onPressOut,
  pressScale = Motion.pressScale,
  style,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animateScale = (value: number) => {
    scale.value = withTiming(value, {
      duration: Motion.pressDurationMs,
      easing: Motion.pressEasing,
    });
  };

  return (
    <AnimatedPressableBase
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          animateScale(pressScale);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateScale(1);
        onPressOut?.(event);
      }}
      style={[animatedStyle, style]}
      {...rest}>
      {children}
    </AnimatedPressableBase>
  );
}
