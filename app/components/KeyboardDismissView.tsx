// Zamyka klawiaturę po tapnięciu.
import React, { type ReactNode } from 'react';
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type KeyboardDismissViewProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Ukrywa klawiaturę po tapnięciu poza polem tekstowym.
 * Używaj **wewnątrz** ScrollView (jako opakowanie treści), nie na zewnątrz —
 * owinięcie ScrollView z zewnątrz blokuje gest przewijania.
 */
export default function KeyboardDismissView({
  children,
  style,
}: KeyboardDismissViewProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={style}>{children}</View>
    </TouchableWithoutFeedback>
  );
}
