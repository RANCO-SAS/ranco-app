import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

import { SplashBackground } from '@/constants/splash';

const welcomeSource = require('@/assets/lotties/welcome.json');

const SPLASH_SPEED = 1.5;
const EXIT_FADE_MS = 200;
const LOTTIE_ASPECT = 123 / 428;
const LOTTIE_WIDTH_RATIO = 0.85;

type SplashPhase = 'splash' | 'exiting' | 'done';

type SplashGateProps = {
  children: ReactNode;
};

export function SplashGate({ children }: SplashGateProps) {
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const backgroundColor =
    colorScheme === 'dark' ? SplashBackground.dark : SplashBackground.light;

  const [phase, setPhase] = useState<SplashPhase>('splash');
  const phaseRef = useRef<SplashPhase>('splash');
  const nativeSplashHidden = useRef(false);
  const lottiePlaybackStarted = useRef(false);
  const lottieRef = useRef<LottieView>(null);
  const overlayOpacity = useMemo(() => new Animated.Value(1), []);

  const lottieWidth = screenWidth * LOTTIE_WIDTH_RATIO;
  const lottieHeight = lottieWidth * LOTTIE_ASPECT;

  const setPhaseSafe = useCallback((next: SplashPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const revealSplashAndPlayLottie = useCallback(async () => {
    if (lottiePlaybackStarted.current) {
      return;
    }

    lottiePlaybackStarted.current = true;

    if (!nativeSplashHidden.current) {
      nativeSplashHidden.current = true;
      await SplashScreen.hideAsync();
    }

    lottieRef.current?.reset();
    lottieRef.current?.play();
  }, []);

  const handleOverlayLayout = useCallback(() => {
    void revealSplashAndPlayLottie();
  }, [revealSplashAndPlayLottie]);

  const finishSplash = useCallback(() => {
    setPhaseSafe('done');
  }, [setPhaseSafe]);

  const handleAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (isCancelled || phaseRef.current !== 'splash') {
        return;
      }

      setPhaseSafe('exiting');
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: EXIT_FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          finishSplash();
        }
      });
    },
    [finishSplash, overlayOpacity, setPhaseSafe],
  );

  const isAppVisible = phase === 'done';

  return (
    <View style={styles.root}>
      <View
        style={[styles.content, { opacity: isAppVisible ? 1 : 0 }]}
        pointerEvents={isAppVisible ? 'auto' : 'none'}>
        {children}
      </View>
      {phase !== 'done' ? (
        <Animated.View
          onLayout={handleOverlayLayout}
          pointerEvents={phase === 'exiting' ? 'none' : 'auto'}
          style={[
            StyleSheet.absoluteFill,
            styles.overlay,
            { backgroundColor },
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
