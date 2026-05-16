import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ansColors } from '../../../theme/ansTheme';
import type { DashboardFeature } from '../dashboard.types';
import DashboardIcon from '../icons/DashboardIcon';
import { dashboardFeatureItemStyles as styles } from './DashboardFeatureItem.styles';

type Props = {
  feature: DashboardFeature;
  onPress: (route: string) => void;
};

export default function DashboardFeatureItem({
  feature,
  onPress,
}: Props) {
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
            color={ansColors.surface}
          />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {feature.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
