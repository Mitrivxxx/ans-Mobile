import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  GradesService,
  type SemesterGrades,
} from '../core/scraper/features/grades/grades.service';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function GradesScreen({ navigation }: Props) {
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
      console.error('[GRADES SCREEN]', err);
      setError('Nie udało się pobrać ocen');
    } finally {
      setLoading(false);
    }
  }, [gradesService]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  if (loading) {
    return (
      <View>
        <ActivityIndicator />
        <Text>Wczytywanie ocen...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
        <TouchableOpacity onPress={fetchGrades}>
          <Text>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>← Powrót</Text>
      </TouchableOpacity>
      <Text>Oceny</Text>

      {semesters.length === 0 ? (
        <Text>Brak danych o ocenach</Text>
      ) : (
        semesters.map((semester) => (
          <View key={semester.semester}>
            <Text>{semester.semesterLabel}</Text>
            <Text>Typ: {semester.semesterType}</Text>
            <Text>Średnia semestru: {semester.semesterAverage}</Text>

            {semester.subjects.map((subject) => (
              <View key={`${semester.semester}-${subject.subject}`}>
                <Text>{subject.subject}</Text>
                <Text>Prowadzący: {subject.teacher}</Text>
                <Text>Ocena końcowa: {subject.finalGrade}</Text>
                {subject.partialGrades.length > 0 && (
                  <Text>
                    Oceny cząstkowe: {JSON.stringify(subject.partialGrades)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}
