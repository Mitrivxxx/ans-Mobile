import { gradesColors } from './gradesTheme';

export type GradeBadgeStyle = {
  backgroundColor: string;
  color: string;
};

export function getGradeBadgeStyle(grade: string): GradeBadgeStyle {
  const value = parseFloat(grade.replace(',', '.'));

  if (Number.isNaN(value)) {
    return {
      backgroundColor: gradesColors.gradeGrayBg,
      color: gradesColors.gradeGray,
    };
  }

  if (value >= 5) {
    return {
      backgroundColor: gradesColors.gradeGreenBg,
      color: gradesColors.gradeGreen,
    };
  }

  if (value >= 4) {
    return {
      backgroundColor: gradesColors.gradeBlueBg,
      color: gradesColors.gradeBlue,
    };
  }

  if (value >= 3) {
    return {
      backgroundColor: gradesColors.gradeOrangeBg,
      color: gradesColors.gradeOrange,
    };
  }

  return {
    backgroundColor: gradesColors.gradeRedBg,
    color: gradesColors.gradeRed,
  };
}
