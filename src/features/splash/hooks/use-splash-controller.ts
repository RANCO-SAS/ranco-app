import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, InteractionManager } from 'react-native';

import { getSplashLottieDurationMs } from '@/constants/splash';
import {
  isSplashCompletedForSession,
  markSplashCompletedForSession,
} from '@/features/splash/splash-session';

const EXIT_FADE_MS = 200;
const SPLASH_TIMEOUT_MS = getSplashLottieDurationMs() + 1500;

export type SplashPhase = 'splash' | 'exiting' | 'done';

export function useSplashController() {
  const splashAlreadyCompleted = isSplashCompletedForSession();

  const [phase, setPhase] = useState<SplashPhase>(splashAlreadyCompleted ? 'done' : 'splash');
  const [appReady, setAppReady] = useState(splashAlreadyCompleted);
  const [showLottie, setShowLottie] = useState(false);

  const phaseRef = useRef<SplashPhase>(splashAlreadyCompleted ? 'done' : 'splash');
  const nativeSplashHidden = useRef(splashAlreadyCompleted);
  const animationFinished = useRef(splashAlreadyCompleted);
  const overlayOpacity = useMemo(
    () => new Animated.Value(splashAlreadyCompleted ? 0 : 1),
    [splashAlreadyCompleted],
  );

  const setPhaseSafe = useCallback((next: SplashPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const finishSplash = useCallback(() => {
    markSplashCompletedForSession();
    setPhaseSafe('done');
  }, [setPhaseSafe]);

  const startExitFade = useCallback(() => {
    if (phaseRef.current !== 'splash' || animationFinished.current) {
      return;
    }

    animationFinished.current = true;
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

  const hideNativeSplash = useCallback(async () => {
    if (nativeSplashHidden.current || !appReady || splashAlreadyCompleted) {
      return;
    }

    nativeSplashHidden.current = true;
    await SplashScreen.hideAsync();
    setShowLottie(true);
  }, [appReady, splashAlreadyCompleted]);

  const handleRootLayout = useCallback(() => {
    if (splashAlreadyCompleted) {
      return;
    }

    void hideNativeSplash();
  }, [hideNativeSplash, splashAlreadyCompleted]);

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
    if (splashAlreadyCompleted) {
      return;
    }

    const interactionTask = InteractionManager.runAfterInteractions(() => {
      setAppReady(true);
    });

    return () => {
      interactionTask.cancel();
    };
  }, [splashAlreadyCompleted]);

  useEffect(() => {
    if (splashAlreadyCompleted || !appReady) {
      return;
    }

    void hideNativeSplash();
  }, [appReady, hideNativeSplash, splashAlreadyCompleted]);

  useEffect(() => {
    if (phase !== 'splash' || !appReady || !showLottie || splashAlreadyCompleted) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (phaseRef.current !== 'splash' || animationFinished.current) {
        return;
      }

      startExitFade();
    }, SPLASH_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [appReady, phase, showLottie, splashAlreadyCompleted, startExitFade]);

  const showOverlay = phase !== 'done';
  const isAppVisible = phase === 'done';

  return {
    handleAnimationFinish,
    handleRootLayout,
    isAppVisible,
    overlayOpacity,
    phase,
    showLottie,
    showOverlay,
  };
}
