import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import DashboardInfoBanner from '../features/dashboard/components/DashboardInfoBanner';
import DashboardQuickActions from '../features/dashboard/components/DashboardQuickActions';
import DashboardSchedulePanel from '../features/dashboard/components/DashboardSchedulePanel';
import { dashboardScreenStyles as styles } from '../features/dashboard/DashboardScreen.styles';

const HARMONOGRAM_ACTION_TITLE = 'Plan zajęć';

type Props = {
  navigation: Record<string, never>;
};

export default function DashboardScreen(_props: Props) {
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(
    null
  );
  const showSchedule = selectedQuickAction === HARMONOGRAM_ACTION_TITLE;

  useFocusEffect(
    useCallback(() => {
      setSelectedQuickAction(HARMONOGRAM_ACTION_TITLE);
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardInfoBanner />
        <DashboardQuickActions
          selectedTitle={selectedQuickAction}
          onSelect={setSelectedQuickAction}
        />
        {showSchedule ? (
          <DashboardSchedulePanel key="harmonogram-panel" />
        ) : (
          <View style={styles.emptyState} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
