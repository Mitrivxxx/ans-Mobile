export const WORKDAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt'] as const;

export type WorkWeekDay = {
  label: (typeof WORKDAY_LABELS)[number];
  date: Date;
  dateKey: string;
};

export function dateKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Poniedziałek–piątek tygodnia, w którym leży `referenceDate`. */
export function getCurrentWorkWeek(referenceDate = new Date()): WorkWeekDay[] {
  const monday = new Date(referenceDate);
  const dayOfWeek = monday.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diffToMonday);

  return WORKDAY_LABELS.map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      label,
      date,
      dateKey: dateKeyFromDate(date),
    };
  });
}

/** Domyślny dzień: dziś (Pn–Pt), w weekend — poniedziałek bieżącego tygodnia roboczego. */
export function getDefaultWorkWeekDateKey(referenceDate = new Date()): string {
  const week = getCurrentWorkWeek(referenceDate);
  const todayKey = dateKeyFromDate(referenceDate);
  const todayInWeek = week.find((day) => day.dateKey === todayKey);
  return todayInWeek?.dateKey ?? week[0].dateKey;
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

  return `${year}-${month}-${day}`;
}

export function timeToMinutes(value: string): number {
  const [h, m] = value.split(':');
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}
