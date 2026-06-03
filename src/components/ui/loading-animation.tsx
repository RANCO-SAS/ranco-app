import LottieView from 'lottie-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

const loadingAnimationSource = require('@/assets/lotties/LoadingAnimation.json');

type LoadingAnimationProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function LoadingAnimation({ size = 120, style }: LoadingAnimationProps) {
  return (
    <LottieView
      autoPlay
      loop
      source={loadingAnimationSource}
      style={[styles.animation, { width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  animation: {
    alignSelf: 'center',
  },
});
