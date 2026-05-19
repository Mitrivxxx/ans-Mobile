import { StyleSheet } from 'react-native';

import type { GradesColors } from './gradesTheme';

export const GRADES_HORIZONTAL_PADDING = 20;

export function createGradesScreenStyles(g: GradesColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: g.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: GRADES_HORIZONTAL_PADDING,
      paddingTop: 15,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 8,
      paddingBottom: 20,
    },
    backButton: {
      paddingVertical: 4,
      paddingRight: 12,
      marginRight: 4,
    },
    backText: {
      fontSize: 16,
      color: g.primary,
      fontWeight: '600',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: g.text,
      letterSpacing: 0.2,
      marginBottom: 20,
    },
    centerState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: GRADES_HORIZONTAL_PADDING,
      gap: 16,
    },
    centerStateScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: GRADES_HORIZONTAL_PADDING,
      gap: 16,
    },
    stateText: {
      fontSize: 16,
      color: g.textMuted,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: g.primary,
    },
    retryText: {
      color: g.surface,
      fontSize: 15,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 15,
      color: g.textMuted,
      textAlign: 'center',
      marginTop: 24,
    },
    subjectList: {
      gap: 12,
      marginTop: 4,
    },
  });
}
