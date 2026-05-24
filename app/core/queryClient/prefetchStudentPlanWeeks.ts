import { PlanService } from '../scraper/features/plan/plan.service';
import { referenceDateFromWeekMondayKey } from '../scraper/features/plan/plan.dateRange';
import { SessionExpiredError } from '../scraper/auth/sessionValidation';
import { mapWithConcurrency } from '../utils/mapWithConcurrency';

import { CACHE_UNTIL_REPLACE_STALE_TIME } from './cacheUntilReplace';
import { getPrefetchWeekMondayKeys } from './planWeekWindow';
import { queryClient } from './queryClient';
import { queryKeys } from './queryKeys';

const planService = new PlanService();

const PREFETCH_CONCURRENCY = 2;

/**
 * Poprzedni, bieżący i następny miesiąc kalendarzowy (tygodnie w tym oknie).
 * Bez ponownego fetchu, gdy dane są już w cache.
 */
export async function prefetchStudentPlanWeeks(
  userKey: string,
  referenceDate = new Date()
): Promise<void> {
  const weekMondayKeys = getPrefetchWeekMondayKeys(referenceDate);

  await mapWithConcurrency(weekMondayKeys, PREFETCH_CONCURRENCY, async (weekMondayKey) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.studentPlan.weekLessons(userKey, weekMondayKey),
        queryFn: () =>
          planService.getWeekLessons(
            referenceDateFromWeekMondayKey(weekMondayKey)
          ),
        staleTime: CACHE_UNTIL_REPLACE_STALE_TIME,
      });
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return;
      }
      throw error;
    }
  });
}
