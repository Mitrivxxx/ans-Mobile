import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calendarDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** „Dziś” odświeżane przy powrocie aplikacji na pierwszy plan (np. po północy w tle). */
export function useCalendarToday(): { today: Date; todayKey: string } {
  const [today, setToday] = useState(startOfLocalDay);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        return;
      }
      setToday(startOfLocalDay());
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  const todayKey = useMemo(() => calendarDateKey(today), [today]);

  return { today, todayKey };
}

/** Po zmianie dnia kalendarzowego — przesuń wybraną datę, jeśli była „wczorajszym dziś”. */
export function useSyncSelectedDateToToday(
  todayKey: string,
  setSelectedDate: Dispatch<SetStateAction<string>>
): void {
  const previousTodayKeyRef = useRef(todayKey);

  useEffect(() => {
    const previousTodayKey = previousTodayKeyRef.current;
    if (previousTodayKey === todayKey) {
      return;
    }

    setSelectedDate((selected) =>
      selected === previousTodayKey ? todayKey : selected
    );
    previousTodayKeyRef.current = todayKey;
  }, [todayKey, setSelectedDate]);
}
