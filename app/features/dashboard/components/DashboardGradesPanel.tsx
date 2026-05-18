import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GradesService,
  type SemesterGrades,
} from '../../../core/scraper/features/grades/grades.service';
import GradesSubjectCard from '../../grades/components/GradesSubjectCard';
import { gradesColors } from '../../grades/gradesTheme';
import { dashboardGradesPanelStyles as styles } from './DashboardGradesPanel.styles';

const ACTIVE_STATUS_KEYWORD = 'w trakcie nauki';

function pickActiveSemester(
  semesters: SemesterGrades[]
): SemesterGrades | null {
  if (semesters.length === 0) {
    return null;
  }

  const active = semesters.find((semester) =>
    semester.semesterStatus.toLowerCase().includes(ACTIVE_STATUS_KEYWORD)
  );

  if (active) {
    return active;
  }

  return semesters.reduce((highest, current) =>
    current.semester > highest.semester ? current : highest
  );
}

export default function DashboardGradesPanel() {
  const gradesService = useMemo(() => new GradesService(), []);
  const [semesters, setSemesters] = useState<SemesterGrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await gradesService.getGrades();
      setSemesters(data);
    } catch (err) {
      console.error('[DASHBOARD GRADES]', err);
      setError('Nie udało się pobrać ocen');
    } finally {
      setLoading(false);
    }
  }, [gradesService]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const activeSemester = useMemo(
    () => pickActiveSemester(semesters),
    [semesters]
  );

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
          <TouchableOpacity onPress={fetchGrades} style={styles.retryButton}>
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
            key={`${activeSemester.semester}-${subject.subject}`}
            subject={subject}
          />
        ))}
      </View>
    </View>
  );
}
