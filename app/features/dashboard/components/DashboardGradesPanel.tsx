import React from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import SyncBanner from '../../../components/SyncBanner';
import GradesSubjectCard from '../../grades/components/GradesSubjectCard';
import { useGrades } from '../../grades/hooks/useGrades';
import { useGradesColors } from '../../grades/useGradesColors';
import { useRegisterScreenRefresh } from '../../../hooks/useRegisterScreenRefresh';
import { useSyncBanner } from '../../../hooks/useSyncBanner';
import { GRADES_ACCENT_COLOR } from '../dashboard.quickActions';
import { createDashboardGradesPanelStyles } from './DashboardGradesPanel.styles';

export default function DashboardGradesPanel() {
  const gradesColors = useGradesColors();
  const styles = useThemedStyles(createDashboardGradesPanelStyles);
  const {
    currentSemester,
    loading,
    isSemesterLoading,
    error,
    refetch,
    forceRefresh,
    syncStatus,
  } = useGrades();

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);
  const visibleBannerStatus =
    isSemesterLoading && bannerStatus === 'idle' ? 'loading' : bannerStatus;

  useRegisterScreenRefresh(forceRefresh);

  if (loading) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <ActivityIndicator color={gradesColors.primary} />
          <Text style={styles.stateText}>Wczytywanie ocen...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => void refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  let subjectsContent: React.ReactNode;
  if (isSemesterLoading) {
    subjectsContent = (
      <View style={styles.centerState}>
        <Text style={styles.stateText}>Wczytywanie przedmiotów…</Text>
      </View>
    );
  } else if (!currentSemester || currentSemester.subjects.length === 0) {
    subjectsContent = (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Brak przedmiotów w tym semestrze</Text>
      </View>
    );
  } else {
    subjectsContent = (
      <View style={styles.subjectList}>
        {currentSemester.subjects.map((subject) => (
          <GradesSubjectCard
            key={`${currentSemester.semester}-${subject.subject}-${subject.pplsId ?? 'na'}`}
            subject={subject}
            expandable
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SyncBanner
        status={visibleBannerStatus}
        loadingText="Aktualizowanie ocen…"
        errorText="Nie udało się zaktualizować ocen"
        accentColor={GRADES_ACCENT_COLOR}
        onDismissUpToDate={dismissUpToDate}
      />
      {subjectsContent}
    </View>
  );
}
