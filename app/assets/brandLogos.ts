/**
 * Grafiki wewnątrz aplikacji (React Native <Image />).
 * NIE sterują ikoną na pulpicie — launcher bierze z app.json:
 * assets/icons/logo_mobile.png (+ npm run generate-icons → assets/icon.png dla EAS).
 */
/** Logo na ekran logowania. */
export const logoLogin = require('../../assets/icons/anslogo.png');

/** Logo poziome — pasek nagłówka (204×65), ciemne napisy (jasny motyw). */
export const logoHeader = require('../../assets/icons/logov2.png');

/** Logo poziome — białe napisy (ciemny motyw aplikacji). */
export const logoHeaderDark = require('../../assets/icons/logov2_dark.png');

/** Szerokość / wysokość pliku logov2.png */
export const LOGO_HEADER_ASPECT = 204 / 65;

export function logoHeaderForTheme(isDarkMode: boolean) {
  return isDarkMode ? logoHeaderDark : logoHeader;
}
