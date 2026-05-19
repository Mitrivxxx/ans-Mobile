import React from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

const logoSource = require('../../assets/icons/logov2.png');

const DEFAULT_ACCESSIBILITY_LABEL =
  'Logo Akademii Nauk Stosowanych w Nowym Sączu';

type AppLogoProps = {
  size: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export default function AppLogo({
  size,
  style,
  imageStyle,
  accessibilityLabel = DEFAULT_ACCESSIBILITY_LABEL,
}: AppLogoProps) {
  const radius = size / 2;

  return (
    <View
      style={[
        styles.clip,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      <Image
        source={logoSource}
        style={[{ width: size, height: size }, imageStyle]}
        resizeMode="cover"
        accessibilityLabel={accessibilityLabel}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
});
