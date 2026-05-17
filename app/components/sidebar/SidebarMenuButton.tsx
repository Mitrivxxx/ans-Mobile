import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ansColors } from '../../theme/ansTheme';
import { useSidebar } from './SidebarContext';

type Props = {
  size?: number;
  buttonSize?: number;
};

export default function SidebarMenuButton({
  size = 24,
  buttonSize = 44,
}: Props) {
  const { open } = useSidebar();

  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => [
        styles.button,
        { width: buttonSize, height: buttonSize },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Otwórz menu"
      hitSlop={8}
    >
      <MaterialCommunityIcons name="menu" size={size} color={ansColors.black} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});
