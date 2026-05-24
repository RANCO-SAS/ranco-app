import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loader } from '@/components/ui/loader';
import { Layout, Spacing } from '@/constants/theme';
import { useKeyboardLayout } from '@/hooks/use-keyboard-layout';
import { useTheme } from '@/hooks/use-theme';

type SafeAreaMode = 'full' | 'tab';

type ScreenLayoutProps = ViewProps & {
  scrollable?: boolean;
  centered?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  /** full = stack/modal screens, tab = screens inside bottom tabs */
  safeArea?: SafeAreaMode;
  avoidKeyboard?: boolean;
  /** @deprecated Prefer safeArea="full" | "tab" */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'style'>;
};

function resolveSafeAreaEdges(
  safeArea: SafeAreaMode,
  edges?: ScreenLayoutProps['edges'],
): ('top' | 'bottom' | 'left' | 'right')[] {
  if (edges) {
    return edges;
  }

  return safeArea === 'tab' ? ['top'] : ['top', 'bottom'];
}

export function ScreenLayout({
  scrollable = false,
  centered = false,
  loading = false,
  loadingMessage,
  safeArea = 'full',
  avoidKeyboard = true,
  edges,
  scrollViewProps,
  style,
  children,
  ...rest
}: ScreenLayoutProps) {
  const theme = useTheme();
  const { insets, keyboardBehavior, keyboardVerticalOffset, contentPaddingBottom } =
    useKeyboardLayout();
  const resolvedEdges = resolveSafeAreaEdges(safeArea, edges);

  if (loading) {
    return (
      <SafeAreaView edges={resolvedEdges} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Loader message={loadingMessage} />
      </SafeAreaView>
    );
  }

  const content = (
    <View
      style={[
        styles.content,
        centered && styles.centered,
        safeArea === 'full' && { paddingBottom: Math.max(insets.bottom, Layout.screenPaddingVertical) },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  const scrollContent = (
    <ScrollView
      {...scrollViewProps}
      automaticallyAdjustKeyboardInsets={avoidKeyboard}
      contentContainerStyle={[
        styles.scrollContent,
        centered && styles.centered,
        {
          paddingBottom:
            safeArea === 'tab'
              ? Spacing.xxxl
              : contentPaddingBottom + Layout.screenPaddingVertical,
        },
      ]}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView edges={resolvedEdges} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        enabled={avoidKeyboard}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.flex}>
        {scrollable ? scrollContent : content}
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
    paddingTop: Layout.screenPaddingVertical,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingTop: Layout.screenPaddingVertical,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  centered: {
    justifyContent: 'center',
  },
});
