/** Tło natywnego splash i ekranu startowego — zgodne z motywem aplikacji. */
export const SPLASH_BACKGROUND_LIGHT = '#FFFFFF';
export const SPLASH_BACKGROUND_DARK = '#131922';

/** Minimalny czas widoczności splasha (ikonka) przed ukryciem. 0 = bez opóźnienia. */
export const SPLASH_MIN_DISPLAY_MS = 400;

export function remainingSplashDisplayMs(shownAt: number): number {
  if (SPLASH_MIN_DISPLAY_MS <= 0) {
    return 0;
  }
  return Math.max(0, SPLASH_MIN_DISPLAY_MS - (Date.now() - shownAt));
}

export function waitForMinSplashDisplay(shownAt: number): Promise<void> {
  const ms = remainingSplashDisplayMs(shownAt);
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function splashBackgroundForDarkMode(isDarkMode: boolean): string {
  return isDarkMode ? SPLASH_BACKGROUND_DARK : SPLASH_BACKGROUND_LIGHT;
}
