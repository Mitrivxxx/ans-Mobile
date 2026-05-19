import React from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import GradesSubjectCard from '../../grades/components/GradesSubjectCard';
import { useGrades } from '../../grades/hooks/useGrades';
import { useGradesColors } from '../../grades/useGradesColors';
import { createDashboardGradesPanelStyles } from './DashboardGradesPanel.styles';
import { useRegisterScreenRefresh } from '../../../hooks/useRegisterScreenRefresh';

export default function DashboardGradesPanel() {
  const gradesColors = useGradesColors();
  const styles = useThemedStyles(createDashboardGradesPanelStyles);
  const { currentSemester, loading, error, refetch } = useGrades();

  useRegisterScreenRefresh(refetch);

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
