import React from 'react';
import { View } from 'react-native';

import DashboardFeaturesSection from './components/DashboardFeaturesSection';
import DashboardHeaderSection from './components/DashboardHeaderSection';
import DashboardLogoutSection from './components/DashboardLogoutSection';
import DashboardProfileSection from './components/DashboardProfileSection';
import { useDashboard } from './hooks/useDashboard';

type Props = {
  navigation: {
    navigate: (route: string) => void;
    replace: (route: string) => void;
  };
};

export default function DashboardScreen({ navigation }: Props) {
  const {
    features,
    profileSummary,
    profileLoading,
    onFeaturePress,
    logoutLoading,
    onLogout,
  } = useDashboard(navigation);

  return (
    <View>
      <DashboardHeaderSection />
      <DashboardProfileSection
        summary={profileSummary}
        loading={profileLoading}
      />
      <DashboardFeaturesSection
        features={features}
        onFeaturePress={onFeaturePress}
      />
      <DashboardLogoutSection
        loading={logoutLoading}
        onLogout={onLogout}
      />
    </View>
  );
}
