/** Paleta ekranu ocen. */
export type GradesColors = {
  background: string;
  /** Akcent ekranu ocen — odcień `featureAccents.grades` dobrany pod kontrast. */
  primary: string;
  text: string;
  textMuted: string;
  border: string;
  surface: string;
  gradeGreen: string;
  gradeGreenBg: string;
  gradeBlue: string;
  gradeBlueBg: string;
  gradeYellow: string;
  gradeYellowBg: string;
  gradeRed: string;
  gradeRedBg: string;
  gradeGray: string;
  gradeGrayBg: string;
};

export const lightGradesColors: GradesColors = {
  background: '#EEF0F3',
  primary: '#1A7F77',
  text: '#1E1B2E',
  textMuted: '#8A8699',
  border: '#E5E7EB',
  surface: '#FAFAFA',
  gradeGreen: '#15803D',
  gradeGreenBg: '#86EFAC',
  gradeBlue: '#1D4ED8',
  gradeBlueBg: '#93C5FD',
  gradeYellow: '#A16207',
  gradeYellowBg: '#FDE047',
  gradeRed: '#B91C1C',
  gradeRedBg: '#FCA5A5',
  gradeGray: '#525252',
  gradeGrayBg: '#D4D4D4',
};

export const darkGradesColors: GradesColors = {
  background: '#12171E',
  primary: '#4CC7BC',
  text: '#E8ECF1',
  textMuted: '#A3AEBD',
  border: '#2A3443',
  surface: '#1B222D',
  gradeGreen: '#5EE08F',
  gradeGreenBg: '#143D27',
  gradeBlue: '#7AB4FA',
  gradeBlueBg: '#1B3354',
  gradeYellow: '#F7D154',
  gradeYellowBg: '#3D3108',
  gradeRed: '#FB8A8A',
  gradeRedBg: '#45161A',
  gradeGray: '#B4BAC4',
  gradeGrayBg: '#333B47',
};

export const gradesColors = lightGradesColors;

export function resolveGradesColors(isDarkMode: boolean): GradesColors {
  return isDarkMode ? darkGradesColors : lightGradesColors;
}
