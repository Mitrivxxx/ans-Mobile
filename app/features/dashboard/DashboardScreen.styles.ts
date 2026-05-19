import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export const DASHBOARD_HORIZONTAL_PADDING = 24;

export function createDashboardScreenStyles(c: AnsColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.dashboardBg,
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
    backgroundColor: c.dashboardBg,
  },
});
}
