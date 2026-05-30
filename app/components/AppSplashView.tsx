import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  SPLASH_BACKGROUND,
  SPLASH_IMAGE_WIDTH,
  splashIcon,
} from '../core/preferences/splashTheme';

/**
 * Odpowiednik natywnego splash (expo-splash-screen): to samo tło, obraz,
 * resizeMode i imageWidth (wyśrodkowany, nie na cały ekran).
 */
export default function AppSplashView() {
  const imageSize = useMemo(() => {
    const asset = Image.resolveAssetSource(splashIcon);
    const aspectRatio = asset.width / asset.height;
    return {
      width: SPLASH_IMAGE_WIDTH,
      height: SPLASH_IMAGE_WIDTH / aspectRatio,
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={splashIcon}
        style={imageSize}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BACKGROUND,
  },
});
