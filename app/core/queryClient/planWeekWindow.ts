import {
  getMondayOfWeek,
  getWeekMondayDateKey,
} from '../scraper/features/plan/plan.dateRange';

/** Tygodnie wstecz / do przodu względem bieżącego tygodnia (łącznie 5 tygodni). */
export const PLAN_WEEKS_BACK = 2;
export const PLAN_WEEKS_FORWARD = 2;

/** Klucz okna (poniedziałek bieżącego tygodnia) — ponowny prefetch po zmianie tygodnia. */
export function getPlanPrefetchWindowAnchorKey(referenceDate = new Date()): string {
  return getWeekMondayDateKey(referenceDate);
}

/** Poniedziałki 5 tygodni: 2 wstecz, bieżący, 2 do przodu. */
export function getPrefetchWeekMondayKeys(referenceDate = new Date()): string[] {
  const currentMonday = getMondayOfWeek(referenceDate);
  const keys: string[] = [];

  for (let offset = -PLAN_WEEKS_BACK; offset <= PLAN_WEEKS_FORWARD; offset++) {
    const monday = new Date(currentMonday);
    monday.setDate(monday.getDate() + offset * 7);
    keys.push(getWeekMondayDateKey(monday));
  }

  return keys;
}

export function isWeekInDefaultPrefetchWindow(
  weekMondayKey: string,
  referenceDate = new Date()
): boolean {
  return getPrefetchWeekMondayKeys(referenceDate).includes(weekMondayKey);
}
