import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

export function createDashboardInfoBannerStyles(c: AnsColors) {
  return StyleSheet.create({
  wrap: {
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 24,
    paddingBottom: 6,
  },
  banner: {
    borderRadius: 21,
    paddingVertical: 21,
    paddingHorizontal: 24,
    backgroundColor: c.dashboardBluePale,
    borderWidth: 1,
    borderColor: c.dashboardBlueLight,
  },
  text: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: '500',
    color: '#1A4A6E',
    textAlign: 'center',
  },
});
}
