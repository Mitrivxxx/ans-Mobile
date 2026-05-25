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
  // #region agent log
  fetch('http://127.0.0.1:7884/ingest/daefe8e1-1e84-486a-b8a4-fabf03b42721',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a4b3'},body:JSON.stringify({sessionId:'68a4b3',location:'prefetchStudentPlanWeeks.ts:start',message:'prefetch window start',data:{weekCount:weekMondayKeys.length,firstKey:weekMondayKeys[0],lastKey:weekMondayKeys[weekMondayKeys.length-1]},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  await mapWithConcurrency(weekMondayKeys, PREFETCH_CONCURRENCY, async (weekMondayKey) => {
    const qk = queryKeys.studentPlan.weekLessons(userKey, weekMondayKey);
    const hadCache = queryClient.getQueryData(qk) !== undefined;
    // #region agent log
    fetch('http://127.0.0.1:7884/ingest/daefe8e1-1e84-486a-b8a4-fabf03b42721',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a4b3'},body:JSON.stringify({sessionId:'68a4b3',location:'prefetchStudentPlanWeeks.ts:week',message:'prefetch week',data:{weekMondayKey,hadCache},timestamp:Date.now(),hypothesisId:'C,E'})}).catch(()=>{});
    // #endregion
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
