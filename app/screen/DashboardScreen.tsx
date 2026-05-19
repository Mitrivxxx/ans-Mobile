import React, { useCallback, useState } from 'react';
import { useThemedStyles } from '../theme/useThemedStyles';
import { View } from 'react-native';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import DashboardAnnouncementsPanel from '../features/dashboard/components/DashboardAnnouncementsPanel';
import DashboardGradesPanel from '../features/dashboard/components/DashboardGradesPanel';
import DashboardInfoBanner from '../features/dashboard/components/DashboardInfoBanner';
import DashboardQuickActions from '../features/dashboard/components/DashboardQuickActions';
import DashboardSchedulePanel from '../features/dashboard/components/DashboardSchedulePanel';
import { createDashboardScreenStyles } from '../features/dashboard/DashboardScreen.styles';

const HARMONOGRAM_ACTION_TITLE = 'Plan zajęć';
const GRADES_ACTION_TITLE = 'Przedmioty i oceny';
const ANNOUNCEMENTS_ACTION_TITLE = 'Ogłoszenia';

type Props = {
  navigation: Record<string, never>;
};

export default function DashboardScreen(_props: Props) {
  const styles = useThemedStyles(createDashboardScreenStyles);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(
    null
  );
  const showSchedule = selectedQuickAction === HARMONOGRAM_ACTION_TITLE;
  const showGrades = selectedQuickAction === GRADES_ACTION_TITLE;
  const showAnnouncements =
    selectedQuickAction === ANNOUNCEMENTS_ACTION_TITLE;

  useFocusEffect(
    useCallback(() => {
      setSelectedQuickAction(HARMONOGRAM_ACTION_TITLE);
    }, [])
  );

  let activePanel: React.ReactNode;
  if (showSchedule) {
    activePanel = <DashboardSchedulePanel key="harmonogram-panel" />;
  } else if (showGrades) {
    activePanel = <DashboardGradesPanel key="grades-panel" />;
  } else if (showAnnouncements) {
    activePanel = <DashboardAnnouncementsPanel key="announcements-panel" />;
  } else {
    activePanel = <View style={styles.emptyState} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <RefreshableScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardInfoBanner />
        <DashboardQuickActions
          selectedTitle={selectedQuickAction}
          onSelect={setSelectedQuickAction}
        />
        {activePanel}
      </RefreshableScrollView>
    </SafeAreaView>
  );
}
