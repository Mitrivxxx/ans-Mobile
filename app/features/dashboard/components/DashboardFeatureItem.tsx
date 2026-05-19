import React from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import { Text, TouchableOpacity, View } from 'react-native';

import { useAppTheme } from '../../../context/AppThemeContext';
import type { DashboardFeature } from '../dashboard.types';
import DashboardIcon from '../icons/DashboardIcon';
import { createDashboardFeatureItemStyles } from './DashboardFeatureItem.styles';

type Props = {
  feature: DashboardFeature;
  onPress: (route: string) => void;
};

export default function DashboardFeatureItem({
  feature,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createDashboardFeatureItemStyles);
  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => onPress(feature.route)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${feature.title}. ${feature.description}`}
    >
      <View style={styles.card}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: feature.accentColor },
          ]}
        >
          <DashboardIcon
            name={feature.icon}
            size={28}
            color={colors.surface}
          />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {feature.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
