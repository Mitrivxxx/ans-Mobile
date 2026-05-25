import Constants from 'expo-constants';

export type AppEnv = 'development' | 'presentation' | 'production';

const DEFAULT_WD_BASE_URL = 'https://wd.ans-ns.edu.pl';

function readExtraAppEnv(): AppEnv | null {
  const raw = Constants.expoConfig?.extra?.appEnv;
  if (raw === 'development' || raw === 'presentation' || raw === 'production') {
    return raw;
  }
  return null;
}

export function getAppEnv(): AppEnv {
  const fromExtra = readExtraAppEnv();
  if (fromExtra) {
    return fromExtra;
  }
  return __DEV__ ? 'development' : 'production';
}

export function getWdBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.wdBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra;
  }
  return DEFAULT_WD_BASE_URL;
}

/** Portal WD — jeden URL we wszystkich warstwach (chyba że zmienisz w app.config). */
export const WD_BASE_URL = getWdBaseUrl();

export function isDevLoggingEnabled(): boolean {
  return __DEV__ || getAppEnv() === 'development';
}

export function shouldShowEnvBadge(): boolean {
  return Constants.expoConfig?.extra?.showEnvBadge === true;
}

export function getAppEnvLabel(): string {
  switch (getAppEnv()) {
    case 'development':
      return 'DEV';
    case 'presentation':
      return 'PREZENTACJA';
    default:
      return '';
  }
}

export function getAppEnvDisplayName(): string {
  switch (getAppEnv()) {
    case 'development':
      return 'Deweloperska';
    case 'presentation':
      return 'Prezentacja';
    default:
      return 'Produkcyjna';
  }
}
