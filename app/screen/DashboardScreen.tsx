import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dashboardScreenStyles as styles } from '../features/dashboard/DashboardScreen.styles';

type Props = {
  navigation: Record<string, never>;
};

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={styles.emptyState} />
    </SafeAreaView>
  );
}
