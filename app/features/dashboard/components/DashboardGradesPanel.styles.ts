import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../../theme/ansTheme';
import { DASHBOARD_HORIZONTAL_PADDING } from '../DashboardScreen.styles';

export function createDashboardGradesPanelStyles(c: AnsColors) {
  return StyleSheet.create({
  wrap: {
    paddingHorizontal: DASHBOARD_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 24,
  },
  subjectList: {
    gap: 12,
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
