import { useEffect, useRef } from 'react';

import { getPlanPrefetchWindowAnchorKey } from '../../../core/queryClient/planWeekWindow';
import { prefetchStudentPlanWeeks } from '../../../core/queryClient/prefetchStudentPlanWeeks';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';

/**
 * Jednorazowy prefetch 3 miesięcy planu (poprzedni + bieżący + następny) na dashboardzie.
 * Po zmianie miesiąca kalendarzowego okno jest prefetchowane ponownie.
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
