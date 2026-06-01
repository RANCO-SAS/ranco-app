import { Platform } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Routes } from '@/constants/routes';
import { Colors, Spacing } from '@/constants/theme';
import { useActiveMode } from '@/features/profile/hooks/use-active-mode';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TabIconConfig = {
  active: AppIconName;
  inactive: AppIconName;
};

const TAB_ICONS: Record<string, TabIconConfig> = {
  index: { active: 'search', inactive: 'search-outline' },
  discover: { active: 'compass', inactive: 'compass-outline' },
  jobs: { active: 'hand-left', inactive: 'hand-left-outline' },
  messages: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

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
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={String(color)} focused={focused} routeName="index" />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Oportunidades',
          href: showDiscoverTab ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={String(color)} focused={focused} routeName="discover" />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Proyectos',
          href: showJobsTab ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={String(color)} focused={focused} routeName="jobs" />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={String(color)} focused={focused} routeName="messages" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon color={String(color)} focused={focused} routeName="profile" />
          ),
        }}
      />
    </Tabs>
  );
}

type TabBarIconProps = {
  color: string;
  focused: boolean;
  routeName: keyof typeof TAB_ICONS;
};

function TabBarIcon({ color, focused, routeName }: TabBarIconProps) {
  const icons = TAB_ICONS[routeName];

  return <AppIcon color={color} name={focused ? icons.active : icons.inactive} size={22} />;
}
