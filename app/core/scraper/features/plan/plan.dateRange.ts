/** Format daty jak w WD: `2026-5-19` (bez zer wiodących w miesiącu/dniu). */
export function formatWdPlanDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export type PlanFetchParams = {
  dateFrom: string;
  dateTo: string;
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

export function getWeekMondayDateKey(referenceDate = new Date()): string {
  const monday = getMondayOfWeek(referenceDate);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function referenceDateFromWeekMondayKey(weekMondayKey: string): Date {
  const [year, month, day] = weekMondayKey.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

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

export function getSemesterPlanParams(referenceDate = new Date()): PlanFetchParams {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  if (month >= 9) {
    return {
      dateFrom: `${year}-10-1`,
      dateTo: `${year + 1}-2-28`,
      planType: '3',
    };
  }

  if (month === 0) {
    return {
      dateFrom: `${year - 1}-10-1`,
      dateTo: `${year}-2-28`,
      planType: '3',
    };
  }

  return {
    dateFrom: `${year}-2-19`,
    dateTo: `${year}-9-30`,
    planType: '3',
  };
}
