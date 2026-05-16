import { StyleSheet } from 'react-native';

import { gradesColors } from '../gradesTheme';

const GRADE_BADGE_SIZE = 48;

export const gradesSubjectCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: gradesColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: gradesColors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: gradesColors.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  teacher: {
    fontSize: 13,
    color: gradesColors.textMuted,
    lineHeight: 18,
  },
  gradeBadge: {
    width: GRADE_BADGE_SIZE,
    height: GRADE_BADGE_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
