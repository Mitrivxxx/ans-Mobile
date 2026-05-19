import { StyleSheet } from 'react-native';

import type { GradesColors } from '../gradesTheme';

const GRADE_BADGE_SIZE = 48;

export function createGradesSubjectCardStyles(g: GradesColors) {
  return StyleSheet.create({
    wrap: {
      gap: 0,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: g.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: g.border,
      paddingVertical: 16,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    cardExpanded: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    chevron: {
      marginLeft: 2,
    },
    info: {
      flex: 1,
      paddingRight: 12,
    },
    subjectName: {
      fontSize: 16,
      fontWeight: '700',
      color: g.text,
      lineHeight: 22,
      marginBottom: 4,
    },
    teacher: {
      fontSize: 13,
      color: g.textMuted,
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
    details: {
      marginTop: -6,
      paddingTop: 10,
      paddingHorizontal: 14,
      paddingBottom: 14,
      backgroundColor: g.surface,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: g.border,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      gap: 12,
    },
    detailsState: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
    },
    detailsStateText: {
      fontSize: 13,
      color: g.textMuted,
    },
    detailsErrorText: {
      fontSize: 13,
      color: g.gradeRed,
    },
    retryText: {
      fontSize: 13,
      fontWeight: '600',
      color: g.primary,
      marginTop: 4,
    },
    activityBlock: {
      gap: 8,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    activityForm: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: g.text,
    },
    activityFinalBadge: {
      minWidth: 40,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignItems: 'center',
    },
    activityFinalText: {
      fontSize: 14,
      fontWeight: '700',
    },
    partialList: {
      gap: 6,
      paddingLeft: 4,
    },
    partialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    partialLabel: {
      flex: 1,
      fontSize: 13,
      color: g.textMuted,
      lineHeight: 18,
    },
    partialGradeBadge: {
      minWidth: 36,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      alignItems: 'center',
    },
    partialGradeText: {
      fontSize: 13,
      fontWeight: '700',
    },
    noPartialText: {
      fontSize: 13,
      color: g.textMuted,
      fontStyle: 'italic',
      paddingLeft: 4,
    },
  });
}
