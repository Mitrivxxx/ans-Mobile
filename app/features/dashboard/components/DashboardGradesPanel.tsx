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
  const { currentSemester, loading, error, refetch, forceRefresh, syncStatus } =
    useGrades();

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

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

  if (!currentSemester || currentSemester.subjects.length === 0) {
    return (
      <View style={styles.wrap}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak przedmiotów w tym semestrze</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SyncBanner
        status={bannerStatus}
        loadingText="Aktualizowanie ocen…"
        errorText="Nie udało się zaktualizować ocen"
        accentColor={GRADES_ACCENT_COLOR}
        onDismissUpToDate={dismissUpToDate}
      />
      <View style={styles.subjectList}>
        {currentSemester.subjects.map((subject) => (
          <GradesSubjectCard
            key={`${currentSemester.semester}-${subject.subject}-${subject.pplsId ?? 'na'}`}
            subject={subject}
            expandable
          />
        ))}
      </View>
    </View>
  );
}
