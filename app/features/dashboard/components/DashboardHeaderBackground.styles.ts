import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';

export const DASHBOARD_HEADER_HEIGHT = 200;
export const DASHBOARD_HEADER_LOGO_SIZE = 188;

export function createDashboardHeaderBackgroundStyles(c: AnsColors) {
  return StyleSheet.create({
  root: {
    height: DASHBOARD_HEADER_HEIGHT,
    backgroundColor: c.dashboardBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
}
