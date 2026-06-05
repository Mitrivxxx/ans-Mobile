// Style kafelka lekcji w planie.
import { StyleSheet } from 'react-native';

import type { AnsColors } from '../../theme/ansTheme';

export function createScheduleLessonCardStyles(c: AnsColors) {
  return StyleSheet.create({
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },
  timeColumn: {
    width: 48,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: c.charcoal,
    letterSpacing: -0.2,
  },
  timeLine: {
    width: 2,
    height: 24,
    marginVertical: 2,
    borderRadius: 1,
    backgroundColor: c.grayLight,
  },
  lessonCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: c.grayBorder,
    overflow: 'hidden',
    shadowColor: c.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonCardELearning: {
    backgroundColor: c.dashboardBluePale,
    borderColor: c.dashboardBlueLight,
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
    color: c.charcoal,
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
    marginTop: 2,
  },
  lessonMetaText: {
    flex: 1,
    fontSize: 13,
    color: c.gray,
  },
});
}
