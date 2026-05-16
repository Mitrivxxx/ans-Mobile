import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { DashboardFeature } from '../dashboard.types';
import DashboardIcon from '../icons/DashboardIcon';

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
      onPress={() => onPress(feature.route)}
      activeOpacity={0.7}
    >
      <View>
        <DashboardIcon name={feature.icon} size={28} />
        <Text>{feature.title}</Text>
        <Text>{feature.description}</Text>
      </View>
    </TouchableOpacity>
  );
}
