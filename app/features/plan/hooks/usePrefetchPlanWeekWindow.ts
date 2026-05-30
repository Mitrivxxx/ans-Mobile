import { useEffect, useRef } from 'react';

import { getPlanPrefetchWindowAnchorKey } from '../../../core/queryClient/planWeekWindow';
import { prefetchStudentPlanWeeks } from '../../../core/queryClient/prefetchStudentPlanWeeks';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';

/**
 * Jednorazowy prefetch 5 tygodni planu (2 wstecz, bieżący, 2 do przodu) na dashboardzie.
 * Po zmianie tygodnia kalendarzowego okno jest prefetchowane ponownie.
 */
export function usePrefetchPlanWeekWindow(): void {
  const userKey = useQueryUserKey();
  const prefetchedWindowRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userKey) {
      prefetchedWindowRef.current = null;
      return;
    }

    const windowKey = `${userKey}:${getPlanPrefetchWindowAnchorKey()}`;
    if (prefetchedWindowRef.current === windowKey) {
      return;
    }
    prefetchedWindowRef.current = windowKey;

    void prefetchStudentPlanWeeks(userKey);
  }, [userKey]);
}
