import React, { useMemo, useState } from 'react';
import { useAppTheme } from '../context/AppThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { createPlanScreenStyles } from '../features/plan/PlanScreen.styles';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import RefreshableScrollView from '../components/RefreshableScrollView';
import SyncBanner from '../components/SyncBanner';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import ScheduleLessonCard from '../components/schedule/ScheduleLessonCard';
import type { Lesson } from '../core/scraper/features/plan/plan.service';
import { HARMONOGRAM_ACCENT_COLOR } from '../features/dashboard/dashboard.quickActions';
import {
  useCalendarToday,
  useSyncSelectedDateToToday,
} from '../features/plan/hooks/useCalendarToday';
import { useStudentPlanLessons } from '../features/plan/hooks/useStudentPlanLessons';
import { useSyncBanner } from '../hooks/useSyncBanner';

const CALENDAR_LESSON_DOT_COLOR = '#4CAF50';
const CALENDAR_SELECTED_DAY_BG = '#F5D547';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

type CalendarCell = Date | null;

const WEEKDAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
const MONTH_LABELS = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function lessonDateKey(dateText: string): string | null {
  const parts = dateText.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKeyValue: string): string {
  const [year, month, day] = dateKeyValue.split('-');
  if (!year || !month || !day) {
    return dateKeyValue;
  }
  return `${day}.${month}.${year}`;
}

function timeToMinutes(value: string): number {
  const [h, m] = value.split(':');
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

export default function PlanScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createPlanScreenStyles);
  const {
    lessons,
    isInitialLoading,
    isFatalError,
    syncStatus,
    refetch,
    forceRefresh,
  } = useStudentPlanLessons();
  const { bannerStatus, dismissUpToDate } = useSyncBanner(syncStatus);

  useRegisterScreenRefresh(forceRefresh);

  const { today, todayKey } = useCalendarToday();
  const [selectedDate, setSelectedDate] = useState(() => todayKey);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  useSyncSelectedDateToToday(todayKey, setSelectedDate);

  const lessonsByDate = useMemo(() => {
    const map = new Map<string, Lesson[]>();

    lessons.forEach((lesson) => {
      const key = lessonDateKey(lesson.date);
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
    const list = lessonsByDate.get(selectedDate) ?? [];
    return [...list].sort(
      (a, b) => timeToMinutes(a.from) - timeToMinutes(b.from)
    );
  }, [lessonsByDate, selectedDate]);

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  }, [visibleMonth]);

  const monthLabel = `${MONTH_LABELS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;

  const goToPrevMonth = () => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    setVisibleMonth(next);
    setSelectedDate(dateKey(next));
  };

  const goToNextMonth = () => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    setVisibleMonth(next);
    setSelectedDate(dateKey(next));
  };

  if (isInitialLoading) {
    return (
      <RefreshableScrollView
        contentContainerStyle={styles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <ActivityIndicator color={colors.gold} />
        <Text style={styles.stateText}>Wczytywanie planu zajęć...</Text>
      </RefreshableScrollView>
    );
  }

  if (isFatalError) {
    return (
      <RefreshableScrollView
        contentContainerStyle={styles.centerStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.errorText}>Nie udało się pobrać planu zajęć</Text>
        <TouchableOpacity onPress={() => void refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </RefreshableScrollView>
    );
  }

  return (
    <RefreshableScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <SyncBanner
        status={bannerStatus}
        loadingText="Aktualizowanie harmonogramu…"
        errorText="Nie udało się zaktualizować harmonogramu"
        accentColor={HARMONOGRAM_ACCENT_COLOR}
        onDismissUpToDate={dismissUpToDate}
      />

      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.calendarNavButton}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={22}
              color={colors.charcoal}
            />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>{monthLabel}</Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.calendarNavButton}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.charcoal}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAY_LABELS.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.dayGrid}>
          {calendarCells.map((cell, index) => {
            if (!cell) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const key = dateKey(cell);
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const hasLessons = lessonsByDate.has(key);

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedDate(key)}
                style={styles.dayCell}
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.dayCircle,
                    isToday && !isSelected && styles.dayCircleToday,
                    isSelected && styles.dayCircleSelected,
                    isToday && isSelected && styles.dayCircleSelectedToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday && !isSelected && styles.dayTextToday,
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {cell.getDate()}
                  </Text>
                </View>
                {hasLessons ? <View style={styles.lessonDot} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {dayLessons.length === 0 ? (
        <View style={[styles.emptyCard, styles.lessonsSection]}>
          <Text style={styles.emptyText}>Brak zajęć w tym dniu</Text>
        </View>
      ) : (
        <View style={styles.lessonsSection}>
          {dayLessons.map((lesson, index) => (
            <ScheduleLessonCard
              key={`${lesson.date}-${lesson.from}-${lesson.subject}-${index}`}
              lesson={lesson}
            />
          ))}
        </View>
      )}
    </RefreshableScrollView>
  );
}

