import React from 'react';
import {
  Image,
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { LOGO_HEADER_ASPECT, logoHeader } from '../assets/brandLogos';

const DEFAULT_ACCESSIBILITY_LABEL =
  'Logo Akademii Nauk Stosowanych w Nowym Sączu';

type AppLogoProps = {
  /** Średnica (circle) lub wysokość (wide), w px. */
  size: number;
  source?: ImageSourcePropType;
  /** `circle` — logo kwadratowe/okrągłe; `wide` — logo poziome (np. nagłówek). */
  variant?: 'circle' | 'wide';
  /** Stosowane tylko dla `wide`; domyślnie proporcje logov2.png. */
  aspectRatio?: number;
  resizeMode?: ImageResizeMode;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export default function AppLogo({
  size,
  source = logoHeader,
  variant = 'circle',
  aspectRatio = LOGO_HEADER_ASPECT,
  resizeMode = 'contain',
  style,
  imageStyle,
  accessibilityLabel = DEFAULT_ACCESSIBILITY_LABEL,
}: AppLogoProps) {
  const imageWidth =
    variant === 'wide' ? Math.round(size * aspectRatio) : size;
  const imageHeight = size;

  const image = (
    <Image
      source={source}
      style={[
        { width: imageWidth, height: imageHeight },
        imageStyle,
      ]}
      resizeMode={resizeMode}
      accessibilityLabel={accessibilityLabel}
      accessibilityIgnoresInvertColors
    />
  );

  if (variant === 'wide') {
    return (
      <View style={[{ width: imageWidth, height: imageHeight }, style]}>
        {image}
      </View>
    );
  }

  const radius = size / 2;

  return (
    <View
      style={[
        styles.circleClip,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  circleClip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
