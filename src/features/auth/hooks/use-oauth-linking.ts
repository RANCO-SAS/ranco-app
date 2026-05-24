import * as Linking from 'expo-linking';
import { useEffect } from 'react';

import { createSessionFromUrl } from '@/features/auth/utils/create-session-from-url';
import { isSupabaseConfigured } from '@/lib/env';

export function useOAuthLinking(): void {
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (!url || !isSupabaseConfigured()) {
      return;
    }

    void createSessionFromUrl(url).catch(() => {
      // Ignore unrelated deep links.
    });
  }, [url]);
}
