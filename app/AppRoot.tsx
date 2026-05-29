import React, { useEffect, useState } from 'react';

import App from '../App';
import AppBootstrap from './components/AppBootstrap';
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

  if (isDarkMode === null) {
    return null;
  }

  return (
    <AppBootstrap isDarkMode={isDarkMode}>
      <App initialDarkMode={isDarkMode} />
    </AppBootstrap>
  );
}
