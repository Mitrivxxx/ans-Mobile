import React, { useEffect, useMemo, useState } from 'react';
import { useAppTheme } from '../../../context/AppThemeContext';
import { useThemedStyles } from '../../../theme/useThemedStyles';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import SyncBanner from '../../../components/SyncBanner';
import ScheduleLessonCard from '../../../components/schedule/ScheduleLessonCard';
import { HARMONOGRAM_ACCENT_COLOR } from '../dashboard.quickActions';
import { usePrefetchPlanWeekWindow } from '../../plan/hooks/usePrefetchPlanWeekWindow';
import { useStudentPlanWeekLessons } from '../../plan/hooks/useStudentPlanWeekLessons';
import { useSyncBanner } from '../../../hooks/useSyncBanner';
import { getWeekMondayDateKey } from '../../../core/scraper/features/plan/plan.dateRange';
import {
  addCalendarWeeks,
  dateKeyFromDate,
  getCurrentWeek,
  getDefaultWeekDateKey,
  lessonDateKeyFromScraper,
  timeToMinutes,
  type WeekDay,
} from '../utils/workWeek';
import { createDashboardSchedulePanelStyles } from './DashboardSchedulePanel.styles';
import { useRegisterScreenRefresh } from '../../../hooks/useRegisterScreenRefresh';

const MONTH_LABELS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
] as const;

function formatWeekRangeLabel(week: WeekDay[]): string {
  const start = week[0].date;
  const end = week[6].date;
  const year = start.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTH_LABELS[start.getMonth()]} ${year}`;
  }

  return `${start.getDate()} ${MONTH_LABELS[start.getMonth()]} – ${end.getDate()} ${MONTH_LABELS[end.getMonth()]} ${year}`;
}

export default function DashboardSchedulePanel() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createDashboardSchedulePanelStyles);
  usePrefetchPlanWeekWindow();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekReferenceDate = useMemo(
    () => addCalendarWeeks(new Date(), weekOffset),
    [weekOffset]
  );
  const weekMondayKey = useMemo(
    () => getWeekMondayDateKey(weekReferenceDate),
    [weekReferenceDate]
  );
  const calendarWeek = useMemo(
    () => getCurrentWeek(weekReferenceDate),
    [weekReferenceDate]
  );
  const weekRangeLabel = useMemo(
    () => formatWeekRangeLabel(calendarWeek),
    [calendarWeek]
  );

  const {
    lessons,
    isInitialLoading,
    hasCachedLessons,
    isFatalError,
    syncStatus,
    refetch,
    forceRefresh,
  } = useStudentPlanWeekLessons(weekMondayKey);

  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

  useRegisterScreenRefresh(forceRefresh);

  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getDefaultWeekDateKey()
  );

  const todayKey = useMemo(() => dateKeyFromDate(new Date()), []);

  useEffect(() => {
    setSelectedDateKey(getDefaultWeekDateKey(weekReferenceDate));
  }, [weekMondayKey, weekReferenceDate]);

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

  const goToPrevWeek = () => {
    setWeekOffset((offset) => offset - 1);
  };
  const goToNextWeek = () => {
    setWeekOffset((offset) => offset + 1);
  };

  let lessonsContent: React.ReactNode;
  if (isFatalError) {
    lessonsContent = (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>Nie udało się pobrać harmonogramu</Text>
        <TouchableOpacity onPress={() => void refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (isInitialLoading && !hasCachedLessons) {
    lessonsContent = (
      <View style={styles.centerState}>
        <Text style={styles.stateText}>Wczytywanie harmonogramu…</Text>
      </View>
    );
  } else if (dayLessons.length === 0) {
    lessonsContent = (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Brak zajęć w tym dniu</Text>
      </View>
    );
  } else {
    lessonsContent = dayLessons.map((lesson, index) => (
      <ScheduleLessonCard
        key={`${lesson.date}-${lesson.from}-${lesson.subject}-${index}`}
        lesson={lesson}
      />
    ));
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

      <View style={styles.weekHeader}>
        <TouchableOpacity
          onPress={goToPrevWeek}
          style={styles.weekNavButton}
          accessibilityRole="button"
          accessibilityLabel="Poprzedni tydzień"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={colors.charcoal}
          />
        </TouchableOpacity>
        <Text style={styles.weekRangeLabel}>{weekRangeLabel}</Text>
        <TouchableOpacity
          onPress={goToNextWeek}
          style={styles.weekNavButton}
          accessibilityRole="button"
          accessibilityLabel="Następny tydzień"
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={colors.charcoal}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dayRow}>
        {calendarWeek.map((day) => {
          const isToday = day.dateKey === todayKey;
          const isSelected = day.dateKey === selectedDateKey;
          const hasLessons = lessonsByDate.has(day.dateKey);

          return (
            <TouchableOpacity
              key={day.dateKey}
              onPress={() => setSelectedDateKey(day.dateKey)}
              style={[
                styles.dayButton,
                isToday && !isSelected && styles.dayButtonToday,
                isSelected && styles.dayButtonSelected,
                isToday && isSelected && styles.dayButtonSelectedToday,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${day.label} ${day.date.getDate()}`}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isToday && !isSelected && styles.dayLabelToday,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {day.label}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isToday && !isSelected && styles.dayNumberToday,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {day.date.getDate()}
              </Text>
              {hasLessons ? (
                <View
                  style={[
                    styles.dayDot,
                    isToday && !isSelected && styles.dayDotToday,
                    isSelected && styles.dayDotSelected,
                  ]}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {lessonsContent}
    </View>
  );
}
