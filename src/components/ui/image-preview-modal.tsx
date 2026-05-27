import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type ImagePreviewModalProps = {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
  title?: string;
};

export function ImagePreviewModal({
  visible,
  imageUrl,
  onClose,
  title,
}: ImagePreviewModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            {title ? (
              <AppText color="background" numberOfLines={1} variant="bodyMedium">
                {title}
              </AppText>
            ) : (
              <View style={styles.headerSpacer} />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar imagen"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}>
              <AppText color="background" variant="bodyMedium">
                Cerrar
              </AppText>
            </Pressable>
          </View>

          <Pressable accessibilityRole="imagebutton" onPress={onClose} style={styles.imageArea}>
            <Image contentFit="contain" source={{ uri: imageUrl }} style={styles.image} />
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
