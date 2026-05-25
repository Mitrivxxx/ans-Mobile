import type { ExpoConfig } from 'expo/config';

import baseAppJson from './app.json';

export type AppEnv = 'development' | 'presentation' | 'production';

const BASE_PACKAGE = 'pl.matsma.WDMobile';
const WD_BASE_URL = 'https://wd.ans-ns.edu.pl';

const ENV_LAYERS: Record<
  AppEnv,
  { name: string; packageSuffix: string }
> = {
  development: {
    name: 'WDMobile Dev',
    packageSuffix: '.dev',
  },
  presentation: {
    name: 'WDMobile (Prezentacja)',
    packageSuffix: '.presentation',
  },
  production: {
    name: 'WDMobile',
    packageSuffix: '',
  },
};

function resolveAppEnv(): AppEnv {
  const raw = process.env.APP_ENV ?? 'development';
  if (raw === 'presentation' || raw === 'production' || raw === 'development') {
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
    extra: {
      ...base.extra,
      appEnv,
      wdBaseUrl: WD_BASE_URL,
      showEnvBadge: appEnv !== 'production',
    },
  };

  return config as ExpoConfig;
};
