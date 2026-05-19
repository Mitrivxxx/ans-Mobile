import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';

export const DASHBOARD_HEADER_HEIGHT = 200;
export const DASHBOARD_HEADER_LOGO_SIZE = 188;

export const dashboardHeaderBackgroundStyles = StyleSheet.create({
  root: {
    height: DASHBOARD_HEADER_HEIGHT,
    backgroundColor: ansColors.dashboardBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
