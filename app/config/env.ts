import Constants from 'expo-constants';

export type AppEnv = 'production';

const DEFAULT_WD_BASE_URL = 'https://wd.ans-ns.edu.pl';

export function getAppEnv(): AppEnv {
  return 'production';
}

export function getWdBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.wdBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra;
  }
  return DEFAULT_WD_BASE_URL;
}

export const WD_BASE_URL = getWdBaseUrl();

export function isDevLoggingEnabled(): boolean {
  return __DEV__;
}

/** Zostawione, żeby stare gałęzie prezentacji nie włączały danych mock. */
export function isDemoPresentationMode(): boolean {
  return false;
}
