import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { Lesson } from '../../core/scraper/features/plan/paln.service';
import {
  formatLessonSubjectLabel,
  isELearningNotes,
} from '../../features/plan/utils/lessonSubjectLabel';
import { resolveLessonTypeStyle } from '../../theme/lessonTypeTheme';
import { ansColors } from '../../theme/ansTheme';
import { scheduleLessonCardStyles as styles } from './ScheduleLessonCard.styles';

type Props = {
  lesson: Lesson;
};

export default function ScheduleLessonCard({ lesson }: Props) {
  const typeStyle = resolveLessonTypeStyle(lesson.type, lesson.groups);
  const accentColor = typeStyle?.color ?? ansColors.grayLight;
  const groupLabel = lesson.groups;
  const subjectLabel = formatLessonSubjectLabel(lesson.subject, lesson.notes);
  const isELearning = isELearningNotes(lesson.notes);

  return (
    <View style={styles.lessonRow}>
      <View style={styles.timeColumn}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeText}>{lesson.from}</Text>
          <View style={styles.timeLine} />
          <Text style={styles.timeText}>{lesson.to}</Text>
        </View>
      </View>

      <View style={[styles.lessonCard, isELearning && styles.lessonCardELearning]}>
        <View style={[styles.lessonAccent, { backgroundColor: accentColor }]} />
        <View style={styles.lessonBody}>
          <View style={styles.lessonTopRow}>
            <Text style={styles.lessonSubject} numberOfLines={3}>
              {subjectLabel}
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

          {lesson.teacher ? (
            <View style={styles.lessonMetaRow}>
              <MaterialCommunityIcons
                name="account-outline"
                size={14}
                color={ansColors.gray}
              />
              <Text style={styles.lessonMetaText} numberOfLines={2}>
                {lesson.teacher}
              </Text>
            </View>
          ) : null}

          {groupLabel ? (
            <View style={styles.lessonMetaRow}>
              <Text style={styles.lessonMetaText} numberOfLines={2}>
                {groupLabel}
              </Text>
            </View>
          ) : null}

          {lesson.room ? (
            <View style={styles.lessonMetaRow}>
              <Text style={styles.lessonMetaText}>{lesson.room}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
