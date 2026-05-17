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
    gap: 8,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
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
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: ansColors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: ansColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonAccent: {
    width: 6,
  },
  lessonBody: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  lessonTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  lessonSubject: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: ansColors.charcoal,
  },
  lessonTypePill: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  lessonTypeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonMetaText: {
    flex: 1,
    fontSize: 13,
    color: ansColors.gray,
  },
});
