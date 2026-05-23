import {
  getMondayOfWeek,
  getWeekMondayDateKey,
} from '../scraper/features/plan/plan.dateRange';

/** Liczba tygodni do przodu (poza bieżącym) prefetchowanych na dashboardzie. */
export const PLAN_WEEK_PREFETCH_FORWARD = 3;

/** Poniedziałki: bieżący tydzień + {@link PLAN_WEEK_PREFETCH_FORWARD} do przodu. */
export function getPrefetchWeekMondayKeys(referenceDate = new Date()): string[] {
  const monday = getMondayOfWeek(referenceDate);
  const keys: string[] = [];

  for (let offset = 0; offset <= PLAN_WEEK_PREFETCH_FORWARD; offset++) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + offset * 7);
    keys.push(getWeekMondayDateKey(weekStart));
  }

  return keys;
}

export function isWeekInDefaultPrefetchWindow(
  weekMondayKey: string,
  referenceDate = new Date()
): boolean {
  return getPrefetchWeekMondayKeys(referenceDate).includes(weekMondayKey);
}
