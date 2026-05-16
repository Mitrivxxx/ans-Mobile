import React from 'react';
import { Text, View } from 'react-native';

import type { DashboardFeature } from '../dashboard.types';

import DashboardFeatureItem from './DashboardFeatureItem';

type Props = {
  features: DashboardFeature[];
  onFeaturePress: (route: string) => void;
};

export default function DashboardFeaturesSection({
  features,
  onFeaturePress,
}: Props) {
  return (
    <View>
      <Text>Panel użytkownika</Text>
      {features.map((feature) => (
        <DashboardFeatureItem
          key={feature.route}
          feature={feature}
          onPress={onFeaturePress}
        />
      ))}
    </View>
  );
}
