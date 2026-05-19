import { Dimensions, StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

const GRID_GAP = 10;
const screenWidth = Dimensions.get('window').width;

export const QUICK_ACTION_ITEM_WIDTH =
  (screenWidth - DASHBOARD_HORIZONTAL_PADDING * 2 - GRID_GAP * 2) / 3;

export const QUICK_ACTION_ICON_SIZE = 52;
/** Stała wysokość — wszystkie przyciski równe (2 linie tekstu). */
export const QUICK_ACTION_BUTTON_HEIGHT = 116;
export const QUICK_ACTION_TITLE_HEIGHT = 32;

export function createDashboardQuickActionsStyles(c: AnsColors) {
  return StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 8,
    gap: GRID_GAP,
  },
  buttonOuter: {
    width: QUICK_ACTION_ITEM_WIDTH,
    height: QUICK_ACTION_BUTTON_HEIGHT,
  },
  button: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.dashboardFeatureBorder,
    paddingVertical: 12,
    paddingHorizontal: 4,
    overflow: 'hidden',
    shadowColor: c.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconWrap: {
    width: QUICK_ACTION_ICON_SIZE,
    height: QUICK_ACTION_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  titleWrap: {
    height: QUICK_ACTION_TITLE_HEIGHT,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    width: '100%',
    fontSize: 11,
    fontWeight: '600',
    color: c.charcoal,
    textAlign: 'center',
    lineHeight: 14,
  },
  titleFilled: {
    color: c.surface,
  },
});
}
