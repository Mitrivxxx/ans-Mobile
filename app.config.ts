import type { ExpoConfig } from 'expo/config';

import baseAppJson from './app.json';

/** W app.config.ts nie importuj plików .ts — Node/Expo prebuild ich nie rozwiąże. */
const SPLASH_BACKGROUND_LIGHT = '#6E6E6E';
const SPLASH_BACKGROUND_DARK = '#6E6E6E';
const SPLASH_IMAGE_WIDTH = 100;

const PACKAGE_ID = 'pl.matsma.WDMobile';
const WD_BASE_URL = 'https://wd.ans-ns.edu.pl';

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
  const base = baseAppJson.expo;

  const config = {
    ...base,
    name: 'WDMobile',
    splash: {
      ...base.splash,
      ...splashScreenColors,
    },
    ios: {
      ...base.ios,
      bundleIdentifier: PACKAGE_ID,
    },
    android: {
      ...base.android,
      package: PACKAGE_ID,
      splash: {
        ...base.android?.splash,
        ...splashScreenColors,
      },
    } as ExpoConfig['android'],
    extra: {
      ...base.extra,
      appEnv: 'production',
      wdBaseUrl: WD_BASE_URL,
      showEnvBadge: false,
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
