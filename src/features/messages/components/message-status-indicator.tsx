import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import type { MessageDeliveryStatus } from '@/features/messages/types/message.types';
import { useTheme } from '@/hooks/use-theme';

type MessageStatusIndicatorProps = {
  status: MessageDeliveryStatus;
  isOwn: boolean;
};

export function MessageStatusIndicator({ status, isOwn }: MessageStatusIndicatorProps) {
  const theme = useTheme();

  if (!isOwn) {
    return null;
  }

  const color =
    status === 'read' ? '#BFDBFE' : theme.primaryForeground;

  const label = status === 'sent' ? '✓' : '✓✓';

  return (
    <View style={styles.container}>
      <AppText style={[styles.icon, { color, opacity: status === 'sent' ? 0.75 : 1 }]} variant="small">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
  },
  icon: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
});
