import { useEffect, useRef } from 'react';

import { getWeekMondayDateKey } from '../../../core/scraper/features/plan/plan.dateRange';
import { prefetchStudentPlanWeeks } from '../../../core/queryClient/prefetchStudentPlanWeeks';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';

/**
 * Jednorazowy prefetch bieżącego tygodnia + 3 do przodu (dashboard).
 * Po rotacji poniedziałku okno jest prefetchowane ponownie.
 */
export function usePrefetchPlanWeekWindow(): void {
  const userKey = useQueryUserKey();
  const prefetchedWindowRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userKey) {
      prefetchedWindowRef.current = null;
      return;
    }

    const windowKey = `${userKey}:${getWeekMondayDateKey()}`;
    if (prefetchedWindowRef.current === windowKey) {
      return;
    }
    prefetchedWindowRef.current = windowKey;

    void prefetchStudentPlanWeeks(userKey);
  }, [userKey]);
}
