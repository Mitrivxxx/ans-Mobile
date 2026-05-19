import React, { createContext, useContext, useMemo, useState } from 'react';

type AppThemeColors = {
  appBackground: string;
  screenBackground: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  switchTrackOn: string;
  switchTrackOff: string;
  switchThumb: string;
};

type AppThemeContextValue = {
  isDarkMode: boolean;
  colors: AppThemeColors;
  toggleDarkMode: (nextValue?: boolean) => void;
};

const LIGHT_COLORS: AppThemeColors = {
  appBackground: '#F2F3F5',
  screenBackground: '#ECEEF1',
  cardBackground: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  border: '#DDE2E8',
  switchTrackOn: '#4A5568',
  switchTrackOff: '#BCC4CE',
  switchThumb: '#FFFFFF',
};

const DARK_COLORS: AppThemeColors = {
  appBackground: '#0F1318',
  screenBackground: '#131922',
  cardBackground: '#1B2330',
  textPrimary: '#F3F5F7',
  textSecondary: '#A8B3C2',
  border: '#2C3748',
  switchTrackOn: '#6A8BB8',
  switchTrackOff: '#3B4552',
  switchThumb: '#F3F5F7',
};

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const value = useMemo<AppThemeContextValue>(() => {
    return {
      isDarkMode,
      colors: isDarkMode ? DARK_COLORS : LIGHT_COLORS,
      toggleDarkMode: (nextValue?: boolean) => {
        setIsDarkMode((prev) =>
          typeof nextValue === 'boolean' ? nextValue : !prev
        );
      },
    };
  }, [isDarkMode]);

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
