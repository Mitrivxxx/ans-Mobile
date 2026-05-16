import { Dimensions, StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

const GRID_GAP = 14;
const screenWidth = Dimensions.get('window').width;

export const DASHBOARD_FEATURE_CARD_WIDTH =
  (screenWidth - DASHBOARD_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;

export const FEATURE_ICON_CIRCLE_SIZE = 56;

export const dashboardFeatureItemStyles = StyleSheet.create({
  touchable: {
    width: DASHBOARD_FEATURE_CARD_WIDTH,
    borderRadius: 20,
  },
  card: {
    alignItems: 'center',
    backgroundColor: ansColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: ansColors.black,
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
    color: ansColors.charcoal,
    textAlign: 'center',
    lineHeight: 18,
  },
});
