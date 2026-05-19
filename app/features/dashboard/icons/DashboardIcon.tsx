import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

import { useAppTheme } from '../../../context/AppThemeContext';

type Props = {
  name: string;
  size?: number;
  color?: string;
};

const ICON_NAMES: Record<
  string,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  dashboard: 'view-dashboard-outline',
  plan: 'calendar-month-outline',
  grades: 'star-outline',
  announcements: 'bell-outline',
  profile: 'account-outline',
  lecturer: 'account-search-outline',
  settings: 'cog-outline',
};

export default function DashboardIcon({
  name,
  size = 24,
  color,
}: Props) {
  const { colors } = useAppTheme();
  const iconName = ICON_NAMES[name];
  if (!iconName) {
    return null;
  }

  return (
    <MaterialCommunityIcons
      name={iconName}
      size={size}
      color={color ?? colors.charcoal}
    />
  );
}
