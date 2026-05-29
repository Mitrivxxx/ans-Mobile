/** Tło natywnego splash i ekranu startowego — zgodne z motywem aplikacji. */
export const SPLASH_BACKGROUND_LIGHT = '#FFFFFF';
export const SPLASH_BACKGROUND_DARK = '#131922';

export function splashBackgroundForDarkMode(isDarkMode: boolean): string {
  return isDarkMode ? SPLASH_BACKGROUND_DARK : SPLASH_BACKGROUND_LIGHT;
}
