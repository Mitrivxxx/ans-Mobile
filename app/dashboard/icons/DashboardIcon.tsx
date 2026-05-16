import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

type Props = {
  name: string;
  size?: number;
  color?: string;
};

const ICON_NAMES: Record<
  string,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  plan: 'calendar-month-outline',
  grades: 'star-outline',
  announcements: 'bell-outline',
  profile: 'account-outline',
  lecturer: 'account-search-outline',
};

export default function DashboardIcon({
  name,
  size = 24,
  color = '#1a1a1a',
}: Props) {
  const iconName = ICON_NAMES[name];
  if (!iconName) {
    return null;
  }

  return (
    <MaterialCommunityIcons
      name={iconName}
      size={size}
      color={color}
    />
  );
}
