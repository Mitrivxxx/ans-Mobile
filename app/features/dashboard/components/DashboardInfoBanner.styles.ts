import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

export const dashboardInfoBannerStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 24,
    paddingBottom: 6,
  },
  banner: {
    borderRadius: 21,
    paddingVertical: 21,
    paddingHorizontal: 24,
    backgroundColor: ansColors.dashboardBluePale,
    borderWidth: 1,
    borderColor: ansColors.dashboardBlueLight,
  },
  text: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: '500',
    color: '#1A4A6E',
    textAlign: 'center',
  },
});
