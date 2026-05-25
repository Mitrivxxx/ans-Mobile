import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

export type AppEnv = 'development' | 'presentation' | 'production';

const DEFAULT_WD_BASE_URL = 'https://wd.ans-ns.edu.pl';

/** Kanał z APK (natywny) — nie zależy od błędnego bundla OTA. */
function readNativeOtaChannel(): AppEnv | null {
  if (__DEV__ || !Updates.isEnabled) {
    return null;
  }
  const channel = Updates.channel;
  if (channel === 'production' || channel === 'presentation' || channel === 'development') {
    return channel;
  }
  return null;
}

function readExtraAppEnv(): AppEnv | null {
  const raw = Constants.expoConfig?.extra?.appEnv;
  if (raw === 'development' || raw === 'presentation' || raw === 'production') {
    return raw;
  }
  return null;
}

export function getAppEnv(): AppEnv {
  const fromChannel = readNativeOtaChannel();
  if (fromChannel) {
    return fromChannel;
  }

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

/** Tylko build / tryb deweloperski — nie na produkcji (kanał production w APK). */
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
    case 'presentation':
      return 'Prezentacja';
    default:
      return 'Produkcyjna';
  }
}
