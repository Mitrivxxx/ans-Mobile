import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { SemesterGrades } from '../../../core/scraper/features/grades/grades.service';
import { useGradesColors } from '../useGradesColors';
import { useGradesThemedStyles } from '../useGradesThemedStyles';
import GradesSummaryCard from './GradesSummaryCard';
import {
  ARROW_OUTSIDE_SIZE,
  createGradesSemesterPanelStyles,
} from './GradesSemesterPanel.styles';

type Props = {
  semester: SemesterGrades;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export default function GradesSemesterPanel({
  semester,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: Props) {
  const gradesColors = useGradesColors();
  const styles = useGradesThemedStyles(createGradesSemesterPanelStyles);

  return (
    <View>
      <View style={styles.wrap}>
        <View style={styles.arrowSlot}>
          {canGoPrevious ? (
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={onPrevious}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Poprzedni semestr"
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={32}
                color={gradesColors.primary}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: ARROW_OUTSIDE_SIZE }} />
          )}
        </View>

        <View style={styles.cardSlot}>
          <GradesSummaryCard semester={semester} />
        </View>

        <View style={styles.arrowSlot}>
          {canGoNext ? (
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={onNext}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Następny semestr"
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={32}
                color={gradesColors.primary}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: ARROW_OUTSIDE_SIZE }} />
          )}
        </View>
      </View>
    </View>
  );
}
