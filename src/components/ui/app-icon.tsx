import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type AppIconName = ComponentProps<typeof Ionicons>['name'];

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color: string;
};

export function AppIcon({ name, size = 24, color }: AppIconProps) {
  return <Ionicons color={color} name={name} size={size} />;
}
