import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

const successSource = require('@/assets/lotties/Success.json');

const LOTTIE_ASPECT = 1;
const LOTTIE_WIDTH_RATIO = 0.55;
const FALLBACK_DISMISS_MS = 5000;

type SuccessLottieOverlayProps = {
  visible: boolean;
  message?: string;
  onFinish: () => void;
};

export function SuccessLottieOverlay({ visible, message, onFinish }: SuccessLottieOverlayProps) {
  const { width: screenWidth } = useWindowDimensions();
  const finishedRef = useRef(false);
  const lottieWidth = screenWidth * LOTTIE_WIDTH_RATIO;
  const lottieHeight = lottieWidth * LOTTIE_ASPECT;

  useEffect(() => {
    if (!visible) {
      finishedRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish();
      }
    }, FALLBACK_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [onFinish, visible]);

  const handleAnimationFinish = (isCancelled?: boolean) => {
    if (isCancelled || finishedRef.current) {
      return;
    }

    finishedRef.current = true;
    onFinish();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal animationType="fade" transparent visible>
      <View style={styles.backdrop}>
        <LottieView
          autoPlay
          key="success-lottie"
          loop={false}
          onAnimationFinish={handleAnimationFinish}
          source={successSource}
          style={{ width: lottieWidth, height: lottieHeight }}
        />
        {message ? (
          <AppText align="center" color="background" style={styles.message} variant="subtitle">
            {message}
          </AppText>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  message: {
    marginTop: Spacing.lg,
  },
});
