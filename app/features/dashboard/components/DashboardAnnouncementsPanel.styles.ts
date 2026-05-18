import { StyleSheet } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

export const dashboardAnnouncementsPanelStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 24,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: ansColors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ansColors.dashboardFeatureBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ansColors.charcoal,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  metaAuthor: {
    flex: 1,
    fontSize: 13,
    color: ansColors.gray,
  },
  metaDate: {
    fontSize: 12,
    color: ansColors.grayLight,
    fontWeight: '600',
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
