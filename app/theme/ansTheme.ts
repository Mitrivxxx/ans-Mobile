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
  error: string;
  errorBg: string;
  successBg: string;
  successBorder: string;
  dashboardBlue: string;
  dashboardBlueMid: string;
  dashboardBlueLight: string;
  dashboardBluePale: string;
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
  error: '#B71C1C',
  errorBg: '#FFEBEE',
  successBg: '#F3FBF5',
  successBorder: '#B8E6C1',
  dashboardBlue: '#6BA3D6',
  dashboardBlueMid: '#8BB8E3',
  dashboardBlueLight: '#B8D9F2',
  dashboardBluePale: '#E3F0FA',
  switchTrackOn: '#4A5568',
  switchTrackOff: '#BCC4CE',
  switchThumb: '#FFFFFF',
};

/** Ciemny motyw — reszta aplikacji po włączeniu w ustawieniach. */
export const darkAnsColors: AnsColors = {
  gold: '#C9A227',
  goldLight: '#E5C100',
  goldDark: '#D4B84A',
  black: '#0D0D0D',
  charcoal: '#F3F5F7',
  gray: '#A8B3C2',
  grayLight: '#8B96A8',
  grayBorder: '#2C3748',
  background: '#0F1318',
  dashboardBg: '#131922',
  dashboardFeatureBg: '#1B2330',
  dashboardFeatureBorder: '#2C3748',
  surface: '#1B2330',
  error: '#EF5350',
  errorBg: '#3D1F24',
  successBg: '#1A2A22',
  successBorder: '#2D4A38',
  dashboardBlue: '#6BA3D6',
  dashboardBlueMid: '#8BB8E3',
  dashboardBlueLight: '#4A6A8A',
  dashboardBluePale: '#1E2A3D',
  switchTrackOn: '#6A8BB8',
  switchTrackOff: '#3B4552',
  switchThumb: '#F3F5F7',
};

/** Statyczne kolory jasne — tylko ekran logowania i powiązane komponenty. */
export const ansColors = lightAnsColors;

export function resolveAnsColors(isDarkMode: boolean): AnsColors {
  return isDarkMode ? darkAnsColors : lightAnsColors;
}
