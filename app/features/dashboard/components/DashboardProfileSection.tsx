import React from 'react';
import { View } from 'react-native';

import type { ProfileSummary } from '../../../core/scraper/features/profile/profile.service';
import DashboardMiniProfile from './DashboardMiniProfile';
import { dashboardProfileSectionStyles as styles } from './DashboardProfileSection.styles';

type Props = {
  summary: ProfileSummary | null;
  loading: boolean;
};

export default function DashboardProfileSection({ summary, loading }: Props) {
  return (
    <View style={styles.block}>
      <DashboardMiniProfile summary={summary} loading={loading} />
    </View>
  );
}
