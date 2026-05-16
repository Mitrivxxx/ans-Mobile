import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';

export const DASHBOARD_HEADER_HEIGHT = 200;

export const dashboardHeaderBackgroundStyles = StyleSheet.create({
  root: {
    height: DASHBOARD_HEADER_HEIGHT,
    backgroundColor: ansColors.dashboardBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 188,
    height: 188,
  },
});
