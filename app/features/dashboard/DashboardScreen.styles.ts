import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';

export const DASHBOARD_HORIZONTAL_PADDING = 24;

export const dashboardScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
  },
  emptyState: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
  },
});
