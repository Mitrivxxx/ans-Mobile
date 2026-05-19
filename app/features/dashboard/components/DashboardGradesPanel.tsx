import React, { useMemo } from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { pickActiveSemester } from '../../../core/scraper/features/grades/pickPrioritySemester';
import GradesSubjectCard from '../../grades/components/GradesSubjectCard';
import { useGradesQuery } from '../../grades/hooks/useGradesQuery';
import { useGradesColors } from '../../grades/useGradesColors';
import { createDashboardGradesPanelStyles } from './DashboardGradesPanel.styles';
import { useRegisterScreenRefresh } from '../../../hooks/useRegisterScreenRefresh';

export default function DashboardGradesPanel() {
  const gradesColors = useGradesColors();
  const styles = useThemedStyles(createDashboardGradesPanelStyles);
  const { semesters, isInitialLoading, isFatalError, refetch } = useGradesQuery();

  useRegisterScreenRefresh(async () => {
    await refetch();
  });

  const activeSemester = useMemo(
    () => pickActiveSemester(semesters),
    [semesters]
  );

  const hasActiveSubjects = (activeSemester?.subjects.length ?? 0) > 0;

  if (isInitialLoading && !hasActiveSubjects) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <ActivityIndicator color={gradesColors.primary} />
          <Text style={styles.stateText}>Wczytywanie ocen...</Text>
        </View>
      </View>
    );
  }

  if (isFatalError) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>Nie udało się pobrać ocen</Text>
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

  if (!activeSemester || activeSemester.subjects.length === 0) {
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
      <View style={styles.subjectList}>
        {activeSemester.subjects.map((subject) => (
          <GradesSubjectCard
            key={`${activeSemester.semester}-${subject.subject}-${subject.pplsId ?? 'na'}`}
            subject={subject}
            expandable
          />
        ))}
      </View>
    </View>
  );
}
