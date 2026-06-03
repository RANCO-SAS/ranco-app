import LottieView from 'lottie-react-native';
import type { ReactNode } from 'react';
import { Animated, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

import { SplashBackground } from '@/constants/splash';
import { useSplashController } from '@/features/splash/hooks/use-splash-controller';

const welcomeSource = require('@/assets/lotties/welcome.json');

const SPLASH_SPEED = 1.5;
const LOTTIE_ASPECT = 123 / 428;
const LOTTIE_WIDTH_RATIO = 0.85;
const SPLASH_OVERLAY_Z_INDEX = 999;

type SplashGateProps = {
  children: ReactNode;
};

export function SplashGate({ children }: SplashGateProps) {
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const backgroundColor =
    colorScheme === 'dark' ? SplashBackground.dark : SplashBackground.light;

  const {
    handleAnimationFinish,
    handleRootLayout,
    isAppVisible,
    lottieRef,
    overlayOpacity,
    phase,
    showOverlay,
  } = useSplashController();

  const lottieWidth = screenWidth * LOTTIE_WIDTH_RATIO;
  const lottieHeight = lottieWidth * LOTTIE_ASPECT;

  return (
    <View style={styles.root} onLayout={handleRootLayout}>
      <View
        style={[styles.content, { opacity: isAppVisible ? 1 : 0 }]}
        pointerEvents={isAppVisible ? 'auto' : 'none'}>
        {children}
      </View>
      {showOverlay ? (
        <Animated.View
          pointerEvents={phase === 'exiting' ? 'none' : 'auto'}
          style={[
            StyleSheet.absoluteFill,
            styles.overlay,
            { backgroundColor, zIndex: SPLASH_OVERLAY_Z_INDEX },
            { opacity: overlayOpacity },
          ]}>
          <LottieView
            ref={lottieRef}
            autoPlay={false}
            loop={false}
            source={welcomeSource}
            speed={SPLASH_SPEED}
            onAnimationFinish={handleAnimationFinish}
            style={{ width: lottieWidth, height: lottieHeight }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
