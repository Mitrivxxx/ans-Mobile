import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DashboardFeaturesSection from '../features/dashboard/components/DashboardFeaturesSection';
import DashboardHeaderBackground from '../features/dashboard/components/DashboardHeaderBackground';
import DashboardLogoutSection from '../features/dashboard/components/DashboardLogoutSection';
import DashboardProfileSection from '../features/dashboard/components/DashboardProfileSection';
import { dashboardScreenStyles as styles } from '../features/dashboard/DashboardScreen.styles';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <DashboardHeaderBackground />
          <View style={styles.profileOverlap}>
            <DashboardProfileSection
              summary={profileSummary}
              loading={profileLoading}
            />
          </View>
        </View>

        <View style={styles.body}>
          <DashboardFeaturesSection
            features={features}
            onFeaturePress={onFeaturePress}
          />
          <View style={styles.logoutWrap}>
            <DashboardLogoutSection
              loading={logoutLoading}
              onLogout={onLogout}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
