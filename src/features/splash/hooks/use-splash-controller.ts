import * as SplashScreen from 'expo-splash-screen';
import type LottieView from 'lottie-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, InteractionManager } from 'react-native';

const EXIT_FADE_MS = 200;
const SPLASH_TIMEOUT_MS = 10_000;

export type SplashPhase = 'splash' | 'exiting' | 'done';

export function useSplashController() {
  const [phase, setPhase] = useState<SplashPhase>('splash');
  const [appReady, setAppReady] = useState(false);

  const phaseRef = useRef<SplashPhase>('splash');
  const nativeSplashHidden = useRef(false);
  const lottieStarted = useRef(false);
  const lottieRef = useRef<LottieView>(null);
  const overlayOpacity = useMemo(() => new Animated.Value(1), []);

  const setPhaseSafe = useCallback((next: SplashPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const finishSplash = useCallback(() => {
    setPhaseSafe('done');
  }, [setPhaseSafe]);

  const startExitFade = useCallback(() => {
    if (phaseRef.current !== 'splash') {
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
  }, [finishSplash, overlayOpacity, setPhaseSafe]);

  const playLottieFromStart = useCallback(() => {
    requestAnimationFrame(() => {
      lottieRef.current?.play(0);
    });
  }, []);

  const hideNativeAndPlayLottie = useCallback(async () => {
    if (lottieStarted.current || !appReady) {
      return;
    }

    lottieStarted.current = true;

    if (!nativeSplashHidden.current) {
      nativeSplashHidden.current = true;
      await SplashScreen.hideAsync();
    }

    playLottieFromStart();
  }, [appReady, playLottieFromStart]);

  const handleRootLayout = useCallback(() => {
    void hideNativeAndPlayLottie();
  }, [hideNativeAndPlayLottie]);

  const handleAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (isCancelled || phaseRef.current !== 'splash') {
        return;
      }

      startExitFade();
    },
    [startExitFade],
  );

  useEffect(() => {
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      setAppReady(true);
    });

    return () => {
      interactionTask.cancel();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'splash' || !appReady) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (phaseRef.current !== 'splash') {
        return;
      }

      if (__DEV__) {
        console.error('[Splash] Timeout waiting for Lottie onAnimationFinish');
      }

      startExitFade();
    }, SPLASH_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [appReady, phase, startExitFade]);

  const showOverlay = phase !== 'done';
  const isAppVisible = phase === 'done';

  return {
    appReady,
    handleAnimationFinish,
    handleRootLayout,
    isAppVisible,
    lottieRef,
    overlayOpacity,
    phase,
    showOverlay,
  };
}
