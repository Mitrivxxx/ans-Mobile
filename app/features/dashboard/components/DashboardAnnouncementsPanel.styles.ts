import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

export function createDashboardAnnouncementsPanelStyles(c: AnsColors) {
  return StyleSheet.create({
  wrap: {
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 24,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: c.dashboardFeatureBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.charcoal,
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
    color: c.gray,
  },
  metaDate: {
    fontSize: 12,
    color: c.grayLight,
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
    color: c.gray,
  },
  errorText: {
    fontSize: 14,
    color: c.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: c.black,
  },
  retryButtonText: {
    color: c.gold,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: c.grayBorder,
  },
  emptyText: {
    fontSize: 14,
    color: c.gray,
    textAlign: 'center',
  },
});
}
