import React from 'react';
import { Text, View } from 'react-native';

import type { SemesterGrades } from '../../../core/scraper/features/grades/grades.service';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import { createGradesSummaryCardStyles } from './GradesSummaryCard.styles';

type Props = {
  semester: SemesterGrades;
};

export default function GradesSummaryCard({ semester }: Props) {
  const styles = useThemedStyles(createGradesSummaryCardStyles);

  function DetailRow({ label, value }: { label: string; value: string }) {
    if (!value) {
      return null;
    }

    return (
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>{label} </Text>
        <Text style={styles.detailValue}>{value}</Text>
      </Text>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.averageBlock}>
        <Text style={styles.label}>Średnia semestru</Text>
        <Text style={styles.averageValue}>
          {semester.semesterAverage.replace('.', ',')}
        </Text>
      </View>

      <View style={styles.detailsBlock}>
        <DetailRow label="Semestr:" value={String(semester.semester)} />
        <DetailRow
          label="Semestr akademicki:"
          value={semester.academicSemester}
        />
        <DetailRow label="Stan semestru:" value={semester.semesterStatus} />
      </View>
    </View>
  );
}
