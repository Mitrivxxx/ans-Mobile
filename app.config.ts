import type { ExpoConfig } from 'expo/config';

import {
  SPLASH_BACKGROUND_DARK,
  SPLASH_BACKGROUND_LIGHT,
  SPLASH_IMAGE_WIDTH,
} from './splashTheme.constants.js';
import baseAppJson from './app.json';

export type AppEnv = 'development' | 'demo' | 'production';

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

const SPLASH_IMAGE = './assets/splash-icon.png';

const splashScreenColors = {
  image: SPLASH_IMAGE,
  imageWidth: SPLASH_IMAGE_WIDTH,
  resizeMode: 'contain' as const,
  backgroundColor: SPLASH_BACKGROUND_LIGHT,
  dark: {
    image: SPLASH_IMAGE,
    imageWidth: SPLASH_IMAGE_WIDTH,
    resizeMode: 'contain' as const,
    backgroundColor: SPLASH_BACKGROUND_DARK,
  },
};

export default (): ExpoConfig => {
  const appEnv = resolveAppEnv();
  const layer = ENV_LAYERS[appEnv];
  const base = baseAppJson.expo;
  const packageId = BASE_PACKAGE + layer.packageSuffix;

  const config = {
    ...base,
    name: layer.name,
    splash: {
      ...base.splash,
      ...splashScreenColors,
    },
    ios: {
      ...base.ios,
      bundleIdentifier: packageId,
    },
    android: {
      ...base.android,
      package: packageId,
      splash: {
        ...base.android?.splash,
        ...splashScreenColors,
      },
    } as ExpoConfig['android'],
    extra: {
      ...base.extra,
      appEnv,
      wdBaseUrl: WD_BASE_URL,
      showEnvBadge: appEnv !== 'production',
    },
    plugins: [
      ...(base.plugins ?? []),
      [
        'expo-splash-screen',
        splashScreenColors,
      ],
    ],
  };

  return config as ExpoConfig;
};
