import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';

export const DASHBOARD_HORIZONTAL_PADDING = 24;

export const dashboardScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    minHeight: 120,
    backgroundColor: ansColors.dashboardBg,
  },
});
