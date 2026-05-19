import { Dimensions, StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

const GRID_GAP = 14;
const screenWidth = Dimensions.get('window').width;

export const DASHBOARD_FEATURE_CARD_WIDTH =
  (screenWidth - DASHBOARD_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;

export const FEATURE_ICON_CIRCLE_SIZE = 56;

export function createDashboardFeatureItemStyles(c: AnsColors) {
  return StyleSheet.create({
  touchable: {
    width: DASHBOARD_FEATURE_CARD_WIDTH,
    borderRadius: 20,
  },
  card: {
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.dashboardFeatureBorder,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: c.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: FEATURE_ICON_CIRCLE_SIZE,
    height: FEATURE_ICON_CIRCLE_SIZE,
    borderRadius: FEATURE_ICON_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: c.charcoal,
    textAlign: 'center',
    lineHeight: 18,
  },
});
}
