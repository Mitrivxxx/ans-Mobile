import Constants from 'expo-constants';

export type AppEnv = 'development' | 'demo' | 'production';

const DEFAULT_WD_BASE_URL = 'https://wd.ans-ns.edu.pl';

function readExtraAppEnv(): AppEnv | null {
  const raw = Constants.expoConfig?.extra?.appEnv;
  if (raw === 'development' || raw === 'demo' || raw === 'production') {
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

export const WD_BASE_URL = getWdBaseUrl();

export function isDevLoggingEnabled(): boolean {
  return __DEV__ || getAppEnv() === 'development';
}

/** Tylko build / tryb deweloperski — nie na produkcji. */
export function isProductionApp(): boolean {
  return getAppEnv() === 'production';
}

export function shouldShowEnvBadge(): boolean {
  return getAppEnv() === 'development';
}

export function getAppEnvLabel(): string {
  return getAppEnv() === 'development' ? 'DEV' : '';
}

export function getAppEnvDisplayName(): string {
  switch (getAppEnv()) {
    case 'development':
      return 'Deweloperska';
    case 'demo':
      return 'Demo';
    default:
      return 'Produkcyjna';
  }
}
