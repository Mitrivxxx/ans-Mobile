import React from 'react';
import { Text, View } from 'react-native';

import type { SubjectGrade } from '../../../core/scraper/features/grades/grades.service';
import { getGradeBadgeStyle } from '../gradeBadgeStyle';
import { gradesSubjectCardStyles as styles } from './GradesSubjectCard.styles';

type Props = {
  subject: SubjectGrade;
};

export default function GradesSubjectCard({ subject }: Props) {
  const grade = subject.finalGrade || '—';
  const badgeStyle = getGradeBadgeStyle(subject.finalGrade);

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.subjectName} numberOfLines={2}>
          {subject.subject}
        </Text>
        {subject.teacher ? (
          <Text style={styles.teacher} numberOfLines={1}>
            {subject.teacher}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.gradeBadge,
          { backgroundColor: badgeStyle.backgroundColor },
        ]}
      >
        <Text style={[styles.gradeText, { color: badgeStyle.color }]}>
          {grade}
        </Text>
      </View>
    </View>
  );
}
