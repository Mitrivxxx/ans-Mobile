import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

export function createDashboardAnnouncementsPanelStyles(_c: AnsColors) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
      paddingTop: 8,
      paddingBottom: 24,
    },
  });
}
