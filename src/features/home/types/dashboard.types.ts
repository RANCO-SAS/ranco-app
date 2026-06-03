import type { Href } from 'expo-router';

import type { AppIconName } from '@/components/ui/app-icon';

export type DashboardStat = {
  key: string;
  label: string;
  value: string;
  trailingIcon?: AppIconName;
  trailingIconColor?: string;
};

export type RecentActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: AppIconName;
  iconBackground: string;
  iconColor: string;
  route: Href | null;
};
