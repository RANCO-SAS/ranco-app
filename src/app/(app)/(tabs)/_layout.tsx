import { Platform, Text, type ColorValue } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Routes } from '@/constants/routes';
import { Colors, Spacing } from '@/constants/theme';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const pathname = usePathname();
  const { showDiscoverTab, showJobsTab } = useActiveMode();

  useEffect(() => {
    if (!showDiscoverTab && pathname.includes('(tabs)/discover')) {
      router.replace(Routes.app.home);
      return;
    }

    if (!showJobsTab && pathname.includes('(tabs)/jobs')) {
      router.replace(Routes.app.home);
    }
  }, [pathname, router, showDiscoverTab, showJobsTab]);

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          paddingTop: Spacing.xs,
          height: Platform.select({ ios: 56, default: 52 }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabIcon color={color} label="⌂" />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Oportunidades',
          href: showDiscoverTab ? undefined : null,
          tabBarIcon: ({ color }) => <TabIcon color={color} label="◎" />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Solicitudes',
          href: showJobsTab ? undefined : null,
          tabBarIcon: ({ color }) => <TabIcon color={color} label="▤" />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color }) => <TabIcon color={color} label="✉" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabIcon color={color} label="☺" />,
        }}
      />
    </Tabs>
  );
}

type TabIconProps = {
  color: ColorValue;
  label: string;
};

function TabIcon({ color, label }: TabIconProps) {
  return <Text style={{ color, fontSize: 18, fontWeight: '600' }}>{label}</Text>;
}
