import React from 'react';
import { View } from 'react-native';

import { DASHBOARD_QUICK_ACTIONS } from '../dashboard.quickActions';
import DashboardQuickActionButton from './DashboardQuickActionButton';
import { dashboardQuickActionsStyles as styles } from './DashboardQuickActions.styles';

type Props = {
  selectedTitle: string | null;
  onSelect: (title: string) => void;
};

export default function DashboardQuickActions({
  selectedTitle,
  onSelect,
}: Props) {
  return (
    <View style={styles.wrap}>
      {DASHBOARD_QUICK_ACTIONS.map((action) => (
        <DashboardQuickActionButton
          key={action.title}
          action={action}
          isSelected={selectedTitle === action.title}
          onSelect={() => onSelect(action.title)}
        />
      ))}
    </View>
  );
}
