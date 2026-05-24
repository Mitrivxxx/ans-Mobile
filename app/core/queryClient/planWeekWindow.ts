import {
  getMondayOfWeek,
  getWeekMondayDateKey,
  referenceDateFromWeekMondayKey,
} from '../scraper/features/plan/plan.dateRange';

/** Miesiące wstecz / do przodu względem miesiąca `referenceDate` (łącznie 3 miesiące). */
export const PLAN_MONTH_WINDOW_BACK = 1;
export const PLAN_MONTH_WINDOW_FORWARD = 1;

function endOfCalendarMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0);
}

/** Zakres kalendarzowy: poprzedni miesiąc … następny miesiąc względem `referenceDate`. */
export function getPlanThreeMonthWindowBounds(referenceDate = new Date()): {
  windowStart: Date;
  windowEnd: Date;
} {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const windowStart = new Date(year, month - PLAN_MONTH_WINDOW_BACK, 1);
  const windowEnd = endOfCalendarMonth(
    year,
    month + PLAN_MONTH_WINDOW_FORWARD
  );

  return { windowStart, windowEnd };
}

/** Klucz okna (rok-miesiąc) — ponowny prefetch po zmianie miesiąca kalendarzowego. */
export function getPlanPrefetchWindowAnchorKey(referenceDate = new Date()): string {
  const y = referenceDate.getFullYear();
  const m = String(referenceDate.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Poniedziałki wszystkich tygodni przecinających 3-miesięczne okno. */
export function getPrefetchWeekMondayKeys(referenceDate = new Date()): string[] {
  const { windowStart, windowEnd } = getPlanThreeMonthWindowBounds(referenceDate);
  const firstMonday = getMondayOfWeek(windowStart);
  const lastMonday = getMondayOfWeek(windowEnd);

  const keys: string[] = [];
  const cursor = new Date(firstMonday);

  while (cursor <= lastMonday) {
    keys.push(getWeekMondayDateKey(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }

  return keys;
}

export function isWeekInDefaultPrefetchWindow(
  weekMondayKey: string,
  referenceDate = new Date()
): boolean {
  const weekStart = referenceDateFromWeekMondayKey(weekMondayKey);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const { windowStart, windowEnd } = getPlanThreeMonthWindowBounds(referenceDate);
  return weekEnd >= windowStart && weekStart <= windowEnd;
}
