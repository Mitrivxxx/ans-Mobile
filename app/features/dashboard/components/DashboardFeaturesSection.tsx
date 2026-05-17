import React from 'react';
import { View } from 'react-native';

import type { DashboardFeature } from '../dashboard.types';
import DashboardFeatureItem from './DashboardFeatureItem';
import { dashboardFeaturesSectionStyles as styles } from './DashboardFeaturesSection.styles';

type Props = {
  features: DashboardFeature[];
  onFeaturePress: (route: string) => void;
};

export default function DashboardFeaturesSection({
  features,
  onFeaturePress,
}: Props) {
  return (
    <View style={styles.block}>
      <View style={styles.list}>
        {features.map((feature) => (
          <DashboardFeatureItem
            key={feature.route}
            feature={feature}
            onPress={onFeaturePress}
          />
        ))}
      </View>
    </View>
  );
}
