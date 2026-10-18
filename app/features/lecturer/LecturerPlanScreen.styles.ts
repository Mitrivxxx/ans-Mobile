import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';
import { HARMONOGRAM_ACCENT_COLOR } from '../dashboard/dashboard.quickActions';

const CALENDAR_LESSON_DOT_COLOR = '#4CAF50';

export function createLecturerPlanScreenStyles(c: AnsColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.dashboardBg,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  screenContent: {
    paddingBottom: 32,
    gap: 16,
  },
  infoCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: c.grayBorder,
    gap: 8,
  },
  infoName: {
    fontSize: 18,
    fontWeight: '800',
    color: c.charcoal,
    lineHeight: 24,
  },
  infoBlock: {
    gap: 4,
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: c.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoBody: {
    fontSize: 13,
    color: c.charcoal,
    lineHeight: 20,
  },
  inlineLoading: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    color: c.gray,
  },
  calendarCard: {
    backgroundColor: c.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: c.grayBorder,
    shadowColor: c.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lessonsSection: {
    marginTop: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.charcoal,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.background,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: '14.285%',
    textAlign: 'center',
    fontSize: 12,
    color: c.gray,
    fontWeight: '700',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: c.todayBg,
    borderWidth: 1,
    borderColor: c.todayBorder,
  },
  dayCircleToday: {
    borderWidth: 2.5,
    borderColor: HARMONOGRAM_ACCENT_COLOR,
  },
  dayText: {
    fontSize: 13,
    color: c.charcoal,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: c.todayText,
    fontWeight: '800',
  },
  dayTextToday: {
    color: HARMONOGRAM_ACCENT_COLOR,
    fontWeight: '700',
  },
  lessonDot: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CALENDAR_LESSON_DOT_COLOR,
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
  errorText: {
    fontSize: 14,
    color: c.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: c.retryButtonBg,
  },
  retryButtonText: {
    color: c.retryButtonText,
    fontWeight: '700',
  },
});
}
