import {
  lightGradesColors,
  type GradesColors,
} from './gradesTheme';

export type GradeBadgeStyle = {
  backgroundColor: string;
  color: string;
};

export function getGradeBadgeStyle(
  grade: string,
  palette: GradesColors = lightGradesColors
): GradeBadgeStyle {
  const value = parseFloat(grade.replace(',', '.'));

  if (Number.isNaN(value)) {
    return {
      backgroundColor: palette.gradeGrayBg,
      color: palette.gradeGray,
    };
  }

  if (value < 2) {
    return {
      backgroundColor: palette.gradeGrayBg,
      color: palette.gradeGray,
    };
  }

  if (value >= 5) {
    return {
      backgroundColor: palette.gradeGreenBg,
      color: palette.gradeGreen,
    };
  }

  if (value >= 4) {
    return {
      backgroundColor: palette.gradeBlueBg,
      color: palette.gradeBlue,
    };
  }

  if (value >= 3) {
    return {
      backgroundColor: palette.gradeYellowBg,
      color: palette.gradeYellow,
    };
  }

  return {
    backgroundColor: palette.gradeRedBg,
    color: palette.gradeRed,
  };
}
