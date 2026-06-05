import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import App from '../App';
import { isRememberMeRestoreEligible } from './core/auth/rememberMeBootstrap';
import { isDarkModeEnabled } from './core/preferences/darkMode.storage';
import { ensureScraperInfraReady } from './core/scraper/auth/bootstrapSession';

type BootState = {
  isDarkMode: boolean;
  rememberMeRestore: boolean;
};

const bootPromise: Promise<BootState> = Promise.all([
  isDarkModeEnabled(),
  isRememberMeRestoreEligible(),
]).then(([isDarkMode, rememberMeRestore]) => ({
  isDarkMode,
  rememberMeRestore,
}));

void ensureScraperInfraReady();

export default function AppRoot() {
  const [boot, setBoot] = useState<BootState | null>(null);

  useEffect(() => {
    if (boot !== null) {
      return;
    }
    let cancelled = false;
    void bootPromise.then((state) => {
      if (!cancelled) {
        setBoot(state);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [boot]);

  useEffect(() => {
    if (boot === null) {
      return;
    }
    void SplashScreen.hideAsync().catch(() => {});
  }, [boot]);

  if (boot === null) {
    return null;
  }

  return (
    <App
      initialDarkMode={boot.isDarkMode}
      initialRememberMeRestore={boot.rememberMeRestore}
    />
  );
}
