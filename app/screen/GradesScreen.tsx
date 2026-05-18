import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradesSemesterPanel from '../features/grades/components/GradesSemesterPanel';
import GradesSubjectCard from '../features/grades/components/GradesSubjectCard';
import { gradesScreenStyles as styles } from '../features/grades/GradesScreen.styles';
import { useGrades } from '../features/grades/hooks/useGrades';
import { useSemesterSwipe } from '../features/grades/hooks/useSemesterSwipe';
import { gradesColors } from '../features/grades/gradesTheme';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function GradesScreen({ navigation }: Props) {
  const {
    semesters,
    currentSemester,
    loading,
    error,
    canGoPrevious,
    canGoNext,
    goToPreviousSemester,
    goToNextSemester,
    refetch,
  } = useGrades();

  const swipeHandlers = useSemesterSwipe({
    canGoPrevious,
    canGoNext,
    onPrevious: goToPreviousSemester,
    onNext: goToNextSemester,
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={gradesColors.primary} />
          <Text style={styles.stateText}>Wczytywanie ocen…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <View style={styles.centerState}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetch}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {semesters.length === 0 || !currentSemester ? (
          <Text style={styles.emptyText}>Brak danych o ocenach</Text>
        ) : (
          <View {...swipeHandlers.panHandlers}>
            <GradesSemesterPanel
              semester={currentSemester}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              onPrevious={goToPreviousSemester}
              onNext={goToNextSemester}
            />

            <View style={styles.subjectList}>
              {currentSemester.subjects.length === 0 ? (
                <Text style={styles.emptyText}>
                  Brak przedmiotów w tym semestrze
                </Text>
              ) : (
                currentSemester.subjects.map((subject) => (
                  <GradesSubjectCard
                    key={`${currentSemester.semester}-${subject.subject}`}
                    subject={subject}
                  />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
