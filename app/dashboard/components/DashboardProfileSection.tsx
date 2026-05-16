import React from 'react';

import ProfileSummaryView from '../../components/ProfileSummaryView';
import type { ProfileSummary } from '../../core/scraper/features/profile/profile.service';

type Props = {
  summary: ProfileSummary | null;
  loading: boolean;
};

export default function DashboardProfileSection({ summary, loading }: Props) {
  return <ProfileSummaryView summary={summary} loading={loading} />;
}
