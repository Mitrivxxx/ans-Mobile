import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { Lesson } from '../../../core/scraper/features/plan/paln.service';
import { resolveLessonTypeStyle } from '../../../theme/lessonTypeTheme';
import { ansColors } from '../../../theme/ansTheme';
import { dashboardSchedulePanelStyles as styles } from './DashboardSchedulePanel.styles';

type Props = {
  lesson: Lesson;
};

export default function DashboardScheduleLessonCard({ lesson }: Props) {
  const typeStyle = resolveLessonTypeStyle(lesson.type, lesson.groups);
  const accentColor = typeStyle?.color ?? ansColors.grayLight;

  return (
    <View style={styles.lessonCard}>
      <View style={[styles.lessonAccent, { backgroundColor: accentColor }]} />
      <View style={styles.lessonBody}>
        <View style={styles.lessonTopRow}>
          <Text style={styles.lessonSubject} numberOfLines={2}>
            {lesson.subject}
          </Text>
          {typeStyle ? (
            <View
              style={[
                styles.lessonTypePill,
                { backgroundColor: `${typeStyle.color}22` },
              ]}
            >
              <Text style={[styles.lessonTypeText, { color: typeStyle.color }]}>
                {typeStyle.abbreviation}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.lessonMetaRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={ansColors.gray}
          />
          <Text style={styles.lessonMetaText}>
            {lesson.from} – {lesson.to}
            {lesson.room ? ` - sala ${lesson.room}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}
