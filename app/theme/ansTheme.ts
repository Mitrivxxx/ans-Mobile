import { featureAccents } from './featureAccents';

/** Kolory inspirowane logo ANS (złoto na czerni). */
export type AnsColors = {
  gold: string;
  goldLight: string;
  goldDark: string;
  black: string;
  charcoal: string;
  gray: string;
  grayLight: string;
  grayBorder: string;
  background: string;
  dashboardBg: string;
  dashboardFeatureBg: string;
  dashboardFeatureBorder: string;
  surface: string;
  /** Warstwa nad kartami (menu boczne, rozwijane listy) — w ciemnym motywie jaśniejsza zamiast cienia. */
  surfaceRaised: string;
  backdrop: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  successBg: string;
  successBorder: string;
  successText: string;
  attachmentAccent: string;
  dashboardBlue: string;
  dashboardBlueMid: string;
  dashboardBlueLight: string;
  dashboardBluePale: string;
  /** Tekst na nasyconym akcencie (wybrany dzień, wypełniony kafelek szybkiej akcji). */
  onAccent: string;
  todayBg: string;
  todayBorder: string;
  todayText: string;
  retryButtonBg: string;
  retryButtonText: string;
  primaryButtonBg: string;
  primaryButtonText: string;
  gradesSummaryBg: string;
  gradesSummaryText: string;
  menuDashboardAccent: string;
  menuSettingsAccent: string;
  switchTrackOn: string;
  switchTrackOff: string;
  switchThumb: string;
};

/** Jasny motyw — domyślny, także na ekranie logowania. */
export const lightAnsColors: AnsColors = {
  gold: '#C9A227',
  goldLight: '#E5C100',
  goldDark: '#A8891F',
  black: '#0D0D0D',
  charcoal: '#1A1A1A',
  gray: '#666666',
  grayLight: '#999999',
  grayBorder: '#E8E6E1',
  background: '#F2F3F5',
  dashboardBg: '#ECEEF1',
  dashboardFeatureBg: '#F0F2F5',
  dashboardFeatureBorder: '#DDE2E8',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  backdrop: 'rgba(0, 0, 0, 0.45)',
  error: '#B71C1C',
  errorBg: '#FFEBEE',
  errorBorder: '#F4C7C7',
  successBg: '#F3FBF5',
  successBorder: '#B8E6C1',
  successText: '#2D8C6E',
  attachmentAccent: '#3D8B4A',
  dashboardBlue: '#6BA3D6',
  dashboardBlueMid: '#8BB8E3',
  dashboardBlueLight: '#B8D9F2',
  dashboardBluePale: '#E3F0FA',
  onAccent: '#FFFFFF',
  todayBg: '#F5D547',
  todayBorder: '#F5D547',
  todayText: '#1A1A1A',
  retryButtonBg: '#0D0D0D',
  retryButtonText: '#C9A227',
  primaryButtonBg: '#1A1A1A',
  primaryButtonText: '#FFFFFF',
  gradesSummaryBg: featureAccents.grades,
  gradesSummaryText: '#FFFFFF',
  menuDashboardAccent: '#4A5568',
  menuSettingsAccent: '#5A6575',
  switchTrackOn: '#4A5568',
  switchTrackOff: '#BCC4CE',
  switchThumb: '#FFFFFF',
};

/**
 * Ciemny motyw — grafitowo-granatowe warstwy (tło → ekran → karta → warstwa nad kartą),
 * tekst złamany zamiast czystej bieli, akcenty przyciemnione tam, gdzie zajmują duże płaszczyzny.
 */
export const darkAnsColors: AnsColors = {
  gold: '#C9A227',
  goldLight: '#E5C100',
  goldDark: '#D4B84A',
  black: '#0D0D0D',
  charcoal: '#E8ECF1',
  gray: '#A3AEBD',
  grayLight: '#8691A2',
  grayBorder: '#2A3443',
  background: '#0E1217',
  dashboardBg: '#12171E',
  dashboardFeatureBg: '#1B222D',
  dashboardFeatureBorder: '#2A3443',
  surface: '#1B222D',
  surfaceRaised: '#212A37',
  backdrop: 'rgba(0, 0, 0, 0.62)',
  error: '#F28B82',
  errorBg: '#3A1E22',
  errorBorder: '#5C2E34',
  successBg: '#162A21',
  successBorder: '#2B4D3B',
  successText: '#5CCB98',
  attachmentAccent: '#6FCF7F',
  dashboardBlue: '#7AAFE0',
  dashboardBlueMid: '#8BB8E3',
  dashboardBlueLight: '#3F5F80',
  dashboardBluePale: '#1C2839',
  onAccent: '#0F1318',
  todayBg: '#3B3418',
  todayBorder: '#E3C34A',
  todayText: '#F5D96A',
  retryButtonBg: '#C9A227',
  retryButtonText: '#14110A',
  primaryButtonBg: '#C9A227',
  primaryButtonText: '#14110A',
  gradesSummaryBg: '#1D6B65',
  gradesSummaryText: '#F1F7F6',
  menuDashboardAccent: '#EC7FB4',
  menuSettingsAccent: '#A3AEBD',
  switchTrackOn: '#A88A2E',
  switchTrackOff: '#3A4351',
  switchThumb: '#E8ECF1',
};

/** Statyczne kolory jasne — tylko ekran logowania i powiązane komponenty. */
export const ansColors = lightAnsColors;

export function resolveAnsColors(isDarkMode: boolean): AnsColors {
  return isDarkMode ? darkAnsColors : lightAnsColors;
}
