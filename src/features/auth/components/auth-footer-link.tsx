import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type AuthFooterLinkProps = {
  prompt: string;
  linkLabel: string;
  href: Href;
};

export function AuthFooterLink({ prompt, linkLabel, href }: AuthFooterLinkProps) {
  return (
    <View style={styles.container}>
      {prompt ? (
        <AppText variant="caption" color="textSecondary">
          {prompt}{' '}
        </AppText>
      ) : null}
      <Link href={href} asChild>
        <Pressable>
          <AppText variant="caption" color="primary">
            {linkLabel}
          </AppText>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
