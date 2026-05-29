import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { waitForMinSplashDisplay } from '../core/preferences/splashTheme';
import ThemedSplashOverlay from './ThemedSplashOverlay';

type Props = {
  isDarkMode: boolean;
  children: React.ReactNode;
};

/**
 * Trzyma natywny splash do momentu narysowania nakładki z kolorem z preferencji
 * użytkownika, jednocześnie montując drzewo aplikacji pod spodem (szybszy init).
 */
export default function AppBootstrap({ isDarkMode, children }: Props) {
  const [overlayVisible, setOverlayVisible] = useState(true);
  const shownAtRef = useRef(Date.now());
  const hideStartedRef = useRef(false);

  const onSplashLayout = useCallback(() => {
    if (hideStartedRef.current) {
      return;
    }
    hideStartedRef.current = true;

    const hideSplash = () => {
      void SplashScreen.hideAsync()
        .catch(() => {})
        .finally(() => {
          setOverlayVisible(false);
        });
    };

    void waitForMinSplashDisplay(shownAtRef.current).finally(hideSplash);
  }, []);

  return (
    <View style={styles.root}>
      <View
        style={styles.app}
        pointerEvents={overlayVisible ? 'none' : 'auto'}
        accessibilityElementsHidden={overlayVisible}
        importantForAccessibility={
          overlayVisible ? 'no-hide-descendants' : 'auto'
        }
      >
        {children}
      </View>
      {overlayVisible ? (
        <ThemedSplashOverlay
          isDarkMode={isDarkMode}
          onLayout={onSplashLayout}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  app: {
    flex: 1,
  },
});
