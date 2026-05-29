import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { splashBackgroundForDarkMode } from '../core/preferences/splashTheme';

type Props = {
  isDarkMode: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
};

export default function ThemedSplashOverlay({
  isDarkMode,
  onLayout,
  style,
}: Props) {
  return (
    <View
      onLayout={onLayout}
      style={[
        styles.root,
        { backgroundColor: splashBackgroundForDarkMode(isDarkMode) },
        style,
      ]}
    >
      <Image
        source={require('../../assets/splash-icon.png')}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 280,
    height: 280,
  },
});
