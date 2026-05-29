import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  isDarkModeEnabled,
  setDarkModeEnabled,
} from '../core/preferences/darkMode.storage';
import {
  lightAnsColors,
  resolveAnsColors,
  type AnsColors,
} from '../theme/ansTheme';

type AppThemeContextValue = {
  isDarkMode: boolean;
  isThemeReady: boolean;
  colors: AnsColors;
  toggleDarkMode: (nextValue?: boolean) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
  /** Ustawione przy starcie z AppRoot — unika migotania przed odczytem AsyncStorage. */
  initialDarkMode?: boolean;
};

export function AppThemeProvider({ children, initialDarkMode }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode ?? false);
  const [isThemeReady, setIsThemeReady] = useState(initialDarkMode !== undefined);

  useEffect(() => {
    let cancelled = false;

    void isDarkModeEnabled().then((enabled) => {
      if (!cancelled) {
        setIsDarkMode(enabled);
        setIsThemeReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setDarkMode = useCallback((next: boolean) => {
    setIsDarkMode(next);
    void setDarkModeEnabled(next);
  }, []);

  const toggleDarkMode = useCallback((nextValue?: boolean) => {
    setIsDarkMode((prev) => {
      const next = typeof nextValue === 'boolean' ? nextValue : !prev;
      void setDarkModeEnabled(next);
      return next;
    });
  }, []);

  const value = useMemo<AppThemeContextValue>(() => {
    return {
      isDarkMode,
      isThemeReady,
      colors: resolveAnsColors(isDarkMode),
      toggleDarkMode,
    };
  }, [isDarkMode, isThemeReady, toggleDarkMode]);

  if (!isThemeReady) {
    return (
      <AppThemeContext.Provider
        value={{
          isDarkMode: false,
          isThemeReady: false,
          colors: lightAnsColors,
          toggleDarkMode,
        }}
      >
        {children}
      </AppThemeContext.Provider>
    );
  }

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
