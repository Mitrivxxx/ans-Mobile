/** Paleta ekranu ocen. */
export type GradesColors = {
  background: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  text: string;
  textMuted: string;
  border: string;
  surface: string;
  gradeGreen: string;
  gradeGreenBg: string;
  gradeBlue: string;
  gradeBlueBg: string;
  gradeOrange: string;
  gradeOrangeBg: string;
  gradeRed: string;
  gradeRedBg: string;
  gradeGray: string;
  gradeGrayBg: string;
};

export const lightGradesColors: GradesColors = {
  background: '#EEF0F3',
  primary: '#6B4EAA',
  primaryDark: '#4A3578',
  primaryLight: '#EDE8F5',
  text: '#1E1B2E',
  textMuted: '#8A8699',
  border: '#E5E7EB',
  surface: '#FAFAFA',
  gradeGreen: '#15803D',
  gradeGreenBg: '#86EFAC',
  gradeBlue: '#1D4ED8',
  gradeBlueBg: '#93C5FD',
  gradeOrange: '#C2410C',
  gradeOrangeBg: '#FDBA74',
  gradeRed: '#B91C1C',
  gradeRedBg: '#FCA5A5',
  gradeGray: '#525252',
  gradeGrayBg: '#D4D4D4',
};

export const darkGradesColors: GradesColors = {
  background: '#131922',
  primary: '#9B87D4',
  primaryDark: '#7A6AAF',
  primaryLight: '#2A2438',
  text: '#F3F5F7',
  textMuted: '#A8B3C2',
  border: '#2C3748',
  surface: '#1B2330',
  gradeGreen: '#4ADE80',
  gradeGreenBg: '#14532D',
  gradeBlue: '#60A5FA',
  gradeBlueBg: '#1E3A5F',
  gradeOrange: '#FB923C',
  gradeOrangeBg: '#431407',
  gradeRed: '#F87171',
  gradeRedBg: '#450A0A',
  gradeGray: '#A3A3A3',
  gradeGrayBg: '#404040',
};

export const gradesColors = lightGradesColors;

export function resolveGradesColors(isDarkMode: boolean): GradesColors {
  return isDarkMode ? darkGradesColors : lightGradesColors;
}
