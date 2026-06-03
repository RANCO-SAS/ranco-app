import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Motion, staggerDelay } from '@/constants/motion';

type StaggeredFadeInProps = {
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function fadeInDownEntrance(index = 0) {
  return FadeInDown.delay(staggerDelay(index))
    .duration(Motion.entranceDurationMs)
    .easing(Motion.entranceEasing);
}

export function StaggeredFadeIn({ index, children, style }: StaggeredFadeInProps) {
  return (
    <Animated.View entering={fadeInDownEntrance(index)} style={style}>
      {children}
    </Animated.View>
  );
}
