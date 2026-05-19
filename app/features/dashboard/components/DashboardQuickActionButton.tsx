import React, { useEffect, useRef, useState } from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import type { DashboardQuickAction } from '../dashboard.quickActions';
import { createDashboardQuickActionsStyles } from './DashboardQuickActions.styles';

type Props = {
  action: DashboardQuickAction;
  isSelected: boolean;
  onSelect: () => void;
};

export default function DashboardQuickActionButton({
  action,
  isSelected,
  onSelect,
}: Props) {
  const styles = useThemedStyles(createDashboardQuickActionsStyles);
  const fillProgress = useRef(new Animated.Value(0)).current;
  const [textOnFill, setTextOnFill] = useState(false);

  useEffect(() => {
    if (isSelected) {
      setTextOnFill(true);
      fillProgress.setValue(0);
      Animated.spring(fillProgress, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
        tension: 90,
      }).start();
      return;
    }

    Animated.timing(fillProgress, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setTextOnFill(false);
      }
    });
  }, [fillProgress, isSelected]);

  return (
    <Pressable
      onPress={onSelect}
      style={styles.buttonOuter}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={action.title}
    >
      <View style={styles.button}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.fill,
            {
              backgroundColor: action.fillColor,
              transform: [
                { scaleX: fillProgress },
                { scaleY: fillProgress },
              ],
            },
          ]}
        />
        <View style={styles.content} pointerEvents="none">
          <View style={styles.iconWrap}>
            <Image
              source={action.image}
              style={[
                styles.iconImage,
                action.imageScale
                  ? { transform: [{ scale: action.imageScale }] }
                  : null,
              ]}
              resizeMode="contain"
            />
          </View>
          <View style={styles.titleWrap}>
            <Text
              style={[styles.title, textOnFill && styles.titleFilled]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {action.title}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
