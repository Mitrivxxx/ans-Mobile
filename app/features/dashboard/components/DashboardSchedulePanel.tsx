import React, { useEffect, useMemo, useState } from 'react';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import { Text, TouchableOpacity, View } from 'react-native';

import SyncBanner from '../../../components/SyncBanner';
import ScheduleLessonCard from '../../../components/schedule/ScheduleLessonCard';
import { HARMONOGRAM_ACCENT_COLOR } from '../dashboard.quickActions';
import { useStudentPlanWeekLessons } from '../../plan/hooks/useStudentPlanWeekLessons';
import { useSyncBanner } from '../../../hooks/useSyncBanner';
import {
  getCurrentWeek,
  getDefaultWeekDateKey,
  lessonDateKeyFromScraper,
  timeToMinutes,
} from '../utils/workWeek';
import { createDashboardSchedulePanelStyles } from './DashboardSchedulePanel.styles';
import { useRegisterScreenRefresh } from '../../../hooks/useRegisterScreenRefresh';

export default function DashboardSchedulePanel() {
  const styles = useThemedStyles(createDashboardSchedulePanelStyles);
  const {
    lessons,
    isInitialLoading,
    isFatalError,
    syncStatus,
    refetch,
    forceRefresh,
  } = useStudentPlanWeekLessons();

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

  useRegisterScreenRefresh(forceRefresh);

  const calendarWeek = useMemo(() => getCurrentWeek(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(getDefaultWeekDateKey);

  useEffect(() => {
    setSelectedDateKey(getDefaultWeekDateKey());
  }, []);

  const lessonsByDate = useMemo(() => {
    const map = new Map<string, typeof lessons>();

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

  if (isInitialLoading) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <Text style={styles.stateText}>Wczytywanie harmonogramu…</Text>
        </View>
      </View>
    );
  }

  if (isFatalError) {
    return (
      <View style={styles.wrap}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>Nie udało się pobrać harmonogramu</Text>
          <TouchableOpacity onPress={() => void refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <SyncBanner
        status={bannerStatus}
        loadingText="Aktualizowanie harmonogramu…"
        errorText="Nie udało się zaktualizować harmonogramu"
        accentColor={HARMONOGRAM_ACCENT_COLOR}
        onDismissUpToDate={dismissUpToDate}
      />

      <View style={styles.dayRow}>
        {calendarWeek.map((day) => {
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
          <ScheduleLessonCard
            key={`${lesson.date}-${lesson.from}-${lesson.subject}-${index}`}
            lesson={lesson}
          />
        ))
      )}
    </View>
  );
}
