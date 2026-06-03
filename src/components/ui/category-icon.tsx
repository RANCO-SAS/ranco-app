import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { useTheme } from '@/hooks/use-theme';

type CategoryIconProps = {
  slug: string;
  size?: number;
  color?: string;
};

const CATEGORY_ICONS: Record<string, AppIconName> = {
  home: 'home-outline',
  repairs: 'construct-outline',
  services: 'briefcase-outline',
  care: 'heart-outline',
  other: 'sparkles-outline',
  transport: 'car-outline',
  beauty: 'cut-outline',
  education: 'school-outline',
  events: 'calendar-outline',
};

export function getCategoryIconName(slug: string): AppIconName {
  return CATEGORY_ICONS[slug] ?? 'grid-outline';
}

export function CategoryIcon({ slug, size = 22, color }: CategoryIconProps) {
  const theme = useTheme();

  return <AppIcon color={color ?? theme.primary} name={getCategoryIconName(slug)} size={size} />;
}

export type CategoryIconName = AppIconName;
