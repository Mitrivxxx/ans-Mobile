export const WEEKDAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'] as const;

/** @deprecated Użyj WEEKDAY_LABELS */
export const WORKDAY_LABELS = WEEKDAY_LABELS;

export type WeekDay = {
  label: (typeof WEEKDAY_LABELS)[number];
  date: Date;
  dateKey: string;
};

/** @deprecated Użyj WeekDay */
export type WorkWeekDay = WeekDay;

export function dateKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Poniedziałek–niedziela tygodnia, w którym leży `referenceDate`. */
export function getCurrentWeek(referenceDate = new Date()): WeekDay[] {
  const monday = new Date(referenceDate);
  const dayOfWeek = monday.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diffToMonday);

  return WEEKDAY_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      label,
      date,
      dateKey: dateKeyFromDate(date),
    };
  });
}

/** @deprecated Użyj getCurrentWeek */
export function getCurrentWorkWeek(referenceDate = new Date()): WeekDay[] {
  return getCurrentWeek(referenceDate);
}

/** Przesuwa `referenceDate` o `weeks` tygodni kalendarzowych (±7 dni na tydzień). */
export function addCalendarWeeks(referenceDate: Date, weeks: number): Date {
  const d = new Date(referenceDate);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

/** Domyślny dzień: dziś, jeśli jest w bieżącym tygodniu; w innym wypadku poniedziałek. */
export function getDefaultWeekDateKey(referenceDate = new Date()): string {
  const week = getCurrentWeek(referenceDate);
  const todayKey = dateKeyFromDate(referenceDate);
  const todayInWeek = week.find((day) => day.dateKey === todayKey);
  return todayInWeek?.dateKey ?? week[0].dateKey;
}

/** @deprecated Użyj getDefaultWeekDateKey */
export function getDefaultWorkWeekDateKey(referenceDate = new Date()): string {
  return getDefaultWeekDateKey(referenceDate);
}

export function lessonDateKeyFromScraper(dateText: string): string | null {
  const parts = dateText.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return null;
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function timeToMinutes(value: string): number {
  const [h, m] = value.split(':');
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}
