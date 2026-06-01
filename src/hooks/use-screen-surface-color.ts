import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

import { useTheme } from '@/hooks/use-theme';

export function useScreenSurfaceColor(surfaceColor: string) {
  const theme = useTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(surfaceColor);

    return () => {
      void SystemUI.setBackgroundColorAsync(theme.background);
    };
  }, [surfaceColor, theme.background]);
}
