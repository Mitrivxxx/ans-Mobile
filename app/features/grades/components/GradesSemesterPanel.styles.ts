import { StyleSheet } from 'react-native';

import type { GradesColors } from '../gradesTheme';

export const ARROW_OUTSIDE_SIZE = 40;

export function createGradesSemesterPanelStyles(_g: GradesColors) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      marginHorizontal: -4,
    },
    arrowSlot: {
      width: ARROW_OUTSIDE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowButton: {
      width: ARROW_OUTSIDE_SIZE,
      height: ARROW_OUTSIDE_SIZE,
      borderRadius: ARROW_OUTSIDE_SIZE / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardSlot: {
      flex: 1,
      marginHorizontal: 6,
    },
  });
}
