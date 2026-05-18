import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import ScheduleLessonCard from '../components/schedule/ScheduleLessonCard';
import { PlanService, type Lesson } from '../core/scraper/features/plan/paln.service';
import { HARMONOGRAM_ACCENT_COLOR } from '../features/dashboard/dashboard.quickActions';
import { ansColors } from '../theme/ansTheme';

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
  const planService = useMemo(() => new PlanService(), []);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await planService.getLessons();
      setLessons(data);
    } catch (err) {
      console.error('[PLAN SCREEN]', err);
      setError('Nie udało się pobrać planu zajęć');
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

  const todayKey = dateKey(today);
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

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color={ansColors.gold} />
        <Text style={styles.stateText}>Wczytywanie planu zajęć...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchLessons} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
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
              color={ansColors.charcoal}
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
              color={ansColors.charcoal}
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
                    isSelected && styles.dayCircleSelected,
                    isToday && styles.dayCircleToday,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ansColors.dashboardBg,
  },
  screenContent: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: ansColors.charcoal,
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
    shadowColor: ansColors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 0,
  },
  lessonsSection: {
    marginTop: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ansColors.charcoal,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ansColors.background,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: '14.285%',
    textAlign: 'center',
    fontSize: 12,
    color: ansColors.gray,
    fontWeight: '700',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: CALENDAR_SELECTED_DAY_BG,
  },
  dayCircleToday: {
    borderWidth: 2.5,
    borderColor: HARMONOGRAM_ACCENT_COLOR,
  },
  dayText: {
    fontSize: 13,
    color: ansColors.charcoal,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: ansColors.charcoal,
    fontWeight: '800',
  },
  dayTextToday: {
    color: HARMONOGRAM_ACCENT_COLOR,
    fontWeight: '700',
  },
  lessonDot: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CALENDAR_LESSON_DOT_COLOR,
  },
  lessonsHeader: {
    marginTop: 18,
    marginBottom: 10,
  },
  lessonsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ansColors.charcoal,
  },
  lessonsDate: {
    marginTop: 4,
    fontSize: 13,
    color: ansColors.gray,
  },
  emptyCard: {
    backgroundColor: ansColors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: ansColors.grayBorder,
  },
  emptyText: {
    fontSize: 14,
    color: ansColors.gray,
    textAlign: 'center',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: ansColors.dashboardBg,
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    color: ansColors.gray,
  },
  errorText: {
    fontSize: 14,
    color: ansColors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: ansColors.black,
  },
  retryButtonText: {
    color: ansColors.gold,
    fontWeight: '700',
  },
});
