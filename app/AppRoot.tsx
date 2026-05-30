import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import App from '../App';
import { isDarkModeEnabled } from './core/preferences/darkMode.storage';

const initialDarkModePromise = isDarkModeEnabled();

export default function AppRoot() {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    if (isDarkMode !== null) {
      return;
    }
    let cancelled = false;
    void initialDarkModePromise.then((enabled) => {
      if (!cancelled) {
        setIsDarkMode(enabled);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isDarkMode]);

  useEffect(() => {
    if (isDarkMode === null) {
      return;
    }
    void SplashScreen.hideAsync().catch(() => {});
  }, [isDarkMode]);

  if (isDarkMode === null) {
    return null;
  }

  return <App initialDarkMode={isDarkMode} />;
}
