import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PlanService, type Lesson } from '../../../core/scraper/features/plan/paln.service';
import { ansColors } from '../../../theme/ansTheme';
import {
  getCurrentWorkWeek,
  getDefaultWorkWeekDateKey,
  lessonDateKeyFromScraper,
  timeToMinutes,
} from '../utils/workWeek';
import DashboardScheduleLessonCard from './DashboardScheduleLessonCard';
import { dashboardSchedulePanelStyles as styles } from './DashboardSchedulePanel.styles';

export default function DashboardSchedulePanel() {
  const planService = useMemo(() => new PlanService(), []);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const workWeek = useMemo(() => getCurrentWorkWeek(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(
    getDefaultWorkWeekDateKey
  );

  useEffect(() => {
    setSelectedDateKey(getDefaultWorkWeekDateKey());
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await planService.getLessons();
      setLessons(data);
    } catch (err) {
      console.error('[DASHBOARD SCHEDULE]', err);
      setError('Nie udało się pobrać harmonogramu');
    } finally {
      setLoading(false);
    }
  }, [planService]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const lessonsByDate = useMemo(() => {
    const map = new Map<string, Lesson[]>();

    lessons.forEach((lesson) => {
      const key = lessonDateKeyFromScraper(lesson.date);
      if (!key) {
        return;
      }

      const list = map.get(key) ?? [];
      list.push(lesson);
      map.set(key, list);
    });

    return map;
  }, [lessons]);

  const dayLessons = useMemo(() => {
    const list = lessonsByDate.get(selectedDateKey) ?? [];
    return [...list].sort(
      (a, b) => timeToMinutes(a.from) - timeToMinutes(b.from)
    );
  }, [lessonsByDate, selectedDateKey]);

  if (loading) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <ActivityIndicator color={ansColors.gold} />
          <Text style={styles.stateText}>Wczytywanie harmonogramu...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLessons} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.dayRow}>
        {workWeek.map((day) => {
          const isSelected = day.dateKey === selectedDateKey;
          const hasLessons = lessonsByDate.has(day.dateKey);

          return (
            <TouchableOpacity
              key={day.dateKey}
              onPress={() => setSelectedDateKey(day.dateKey)}
              style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${day.label} ${day.date.getDate()}`}
            >
              <Text
                style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}
              >
                {day.label}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {day.date.getDate()}
              </Text>
              {hasLessons ? (
                <View
                  style={[styles.dayDot, isSelected && styles.dayDotSelected]}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {dayLessons.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Brak zajęć w tym dniu</Text>
        </View>
      ) : (
        dayLessons.map((lesson, index) => (
          <DashboardScheduleLessonCard
            key={`${lesson.date}-${lesson.from}-${lesson.subject}-${index}`}
            lesson={lesson}
          />
        ))
      )}
    </View>
  );
}
