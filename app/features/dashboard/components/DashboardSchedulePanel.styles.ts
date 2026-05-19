import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';
import { HARMONOGRAM_ACCENT_COLOR } from '../dashboard.quickActions';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

export const dashboardSchedulePanelStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 24,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 4,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 14,
    backgroundColor: ansColors.surface,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
  },
  dayButtonSelected: {
    backgroundColor: HARMONOGRAM_ACCENT_COLOR,
    borderColor: HARMONOGRAM_ACCENT_COLOR,
  },
  dayDot: {
    marginTop: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: HARMONOGRAM_ACCENT_COLOR,
  },
  dayDotSelected: {
    backgroundColor: ansColors.surface,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ansColors.gray,
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: ansColors.surface,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: ansColors.charcoal,
  },
  dayNumberSelected: {
    color: ansColors.surface,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    color: ansColors.gray,
  },
  errorText: {
    fontSize: 14,
    color: ansColors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: ansColors.black,
  },
  retryButtonText: {
    color: ansColors.gold,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
  },
  emptyText: {
    fontSize: 14,
    color: ansColors.gray,
    textAlign: 'center',
  },
});
