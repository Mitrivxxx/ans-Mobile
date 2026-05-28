import type { ExpoConfig } from 'expo/config';

import baseAppJson from './app.json';

export type AppEnv = 'development' | 'demo' | 'production';

const BASE_PACKAGE = 'pl.matsma.WDMobile';
const WD_BASE_URL = 'https://wd.ans-ns.edu.pl';

/** Kanał EAS Update — musi pasować do `channel` w profilu eas build / `eas update --channel`. */
const OTA_CHANNEL_BY_ENV: Record<AppEnv, string> = {
  development: 'development',
  demo: 'demo',
  production: 'production',
};

const ENV_LAYERS: Record<
  AppEnv,
  { name: string; packageSuffix: string }
> = {
  development: {
    name: 'WDMobile Dev',
    packageSuffix: '.dev',
  },
  demo: {
    name: 'WDMobile (Demo)',
    packageSuffix: '.demo',
  },
  production: {
    name: 'WDMobile',
    packageSuffix: '',
  },
};

function resolveAppEnv(): AppEnv {
  const easProfile = process.env.EAS_BUILD_PROFILE;
  if (easProfile === 'github' || easProfile === 'production') {
    return 'production';
  }
  if (easProfile === 'demo' || easProfile === 'preview') {
    return 'demo';
  }
  if (easProfile === 'development') {
    return 'development';
  }

  const raw = process.env.APP_ENV ?? 'development';
  if (raw === 'demo' || raw === 'production' || raw === 'development') {
    return raw;
  }
  return 'development';
}

export default (): ExpoConfig => {
  const appEnv = resolveAppEnv();
  const layer = ENV_LAYERS[appEnv];
  const base = baseAppJson.expo;
  const packageId = BASE_PACKAGE + layer.packageSuffix;

  const config = {
    ...base,
    name: layer.name,
    ios: {
      ...base.ios,
      bundleIdentifier: packageId,
    },
    android: {
      ...base.android,
      package: packageId,
    } as ExpoConfig['android'],
    updates: {
      ...base.updates,
      channel: OTA_CHANNEL_BY_ENV[appEnv],
      requestHeaders: {
        'expo-channel-name': OTA_CHANNEL_BY_ENV[appEnv],
      },
      /** Sprawdzanie tylko z JS (Ustawienia), nie przy starcie w natywnym expo-updates. */
      checkAutomatically: 'NEVER',
    },
    extra: {
      ...base.extra,
      appEnv,
      wdBaseUrl: WD_BASE_URL,
      showEnvBadge: appEnv !== 'production',
    },
  };

  return config as ExpoConfig;
};
