import { StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';

export const DASHBOARD_HORIZONTAL_PADDING = 24;
export const DASHBOARD_SCROLL_BOTTOM_PADDING = 40;
export const DASHBOARD_PROFILE_OVERLAP = 48;

export const dashboardScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
  },
  scroll: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: DASHBOARD_SCROLL_BOTTOM_PADDING,
  },
  hero: {
    position: 'relative',
  },
  profileOverlap: {
    marginTop: -DASHBOARD_PROFILE_OVERLAP,
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    zIndex: 1,
  },
  body: {
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 20,
    backgroundColor: ansColors.dashboardBg,
  },
  logoutWrap: {
    marginTop: 28,
  },
});
