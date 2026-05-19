import React from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import { View } from 'react-native';

import type { DashboardFeature } from '../dashboard.types';
import DashboardFeatureItem from './DashboardFeatureItem';
import { createDashboardFeaturesSectionStyles } from './DashboardFeaturesSection.styles';

type Props = {
  features: DashboardFeature[];
  onFeaturePress: (route: string) => void;
};

export default function DashboardFeaturesSection({
  features,
  onFeaturePress,
}: Props) {
  const styles = useThemedStyles(createDashboardFeaturesSectionStyles);
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
