/** Format daty jak w WD: `2026-5-19` (bez zer wiodących w miesiącu/dniu). */
export function formatWdPlanDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export type PlanFetchParams = {
  dateFrom: string;
  dateTo: string;
  /** 2 = widok tygodnia, 3 = widok semestru (wg parametrów WD). */
  planType: string;
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Poniedziałek tygodnia zawierającego `referenceDate`. */
export function getMondayOfWeek(referenceDate = new Date()): Date {
  const monday = startOfDay(referenceDate);
  const dayOfWeek = monday.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diffToMonday);
  return monday;
}

/** Klucz `YYYY-MM-DD` poniedziałku tygodnia zawierającego `referenceDate` (cache React Query). */
export function getWeekMondayDateKey(referenceDate = new Date()): string {
  const monday = getMondayOfWeek(referenceDate);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Data odniesienia dla scrapera z klucza poniedziałku (`YYYY-MM-DD`). */
export function referenceDateFromWeekMondayKey(weekMondayKey: string): Date {
  const [year, month, day] = weekMondayKey.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** Bieżący tydzień kalendarzowy (pon.–niedz.) — do dashboardu. */
export function getCurrentWeekPlanParams(
  referenceDate = new Date()
): PlanFetchParams {
  const monday = getMondayOfWeek(referenceDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    dateFrom: formatWdPlanDate(monday),
    dateTo: formatWdPlanDate(sunday),
    planType: '2',
  };
}

/** Zakres semestru akademicznego — do pełnego planu w sidebarze. */
export function getSemesterPlanParams(referenceDate = new Date()): PlanFetchParams {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  if (month >= 9 || month === 0) {
    const endYear = month === 0 ? year : year + 1;
    return {
      dateFrom: `${year}-10-1`,
      dateTo: `${endYear}-2-28`,
      planType: '3',
    };
  }

  return {
    dateFrom: `${year}-2-19`,
    dateTo: `${year}-9-30`,
    planType: '3',
  };
}
