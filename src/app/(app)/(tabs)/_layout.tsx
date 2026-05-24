import { Platform, Text, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingTop: Spacing.xs,
          height: Platform.select({ ios: 88, default: 64 }),
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
          title: 'Explorar',
          tabBarIcon: ({ color }) => <TabIcon color={color} label="◎" />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Trabajos',
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
