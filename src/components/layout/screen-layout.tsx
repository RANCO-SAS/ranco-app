import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loader } from '@/components/ui/loader';
import { Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenLayoutProps = ViewProps & {
  scrollable?: boolean;
  centered?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function ScreenLayout({
  scrollable = false,
  centered = false,
  loading = false,
  loadingMessage,
  edges = ['top', 'bottom'],
  style,
  children,
  ...rest
}: ScreenLayoutProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Loader message={loadingMessage} />
      </SafeAreaView>
    );
  }

  const content = (
    <View
      style={[
        styles.content,
        centered && styles.centered,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, centered && styles.centered]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Layout.screenPaddingVertical,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Layout.screenPaddingVertical,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  centered: {
    justifyContent: 'center',
  },
});
