import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/plan.service';
import {
  getWeekMondayDateKey,
  referenceDateFromWeekMondayKey,
} from '../../../core/scraper/features/plan/plan.dateRange';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import { useMemo } from 'react';

const planService = new PlanService();

export function useStudentPlanWeekLessons(weekMondayKey?: string) {
  const resolvedWeekMondayKey = weekMondayKey ?? getWeekMondayDateKey();
  const referenceDate = useMemo(
    () => referenceDateFromWeekMondayKey(resolvedWeekMondayKey),
    [resolvedWeekMondayKey]
  );

  const query = useUserPersistentQuery<Lesson[]>({
    queryKey: (userKey) =>
      queryKeys.studentPlan.weekLessons(userKey, resolvedWeekMondayKey),
    queryFn: () => {
      // #region agent log
      fetch('http://127.0.0.1:7884/ingest/daefe8e1-1e84-486a-b8a4-fabf03b42721',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a4b3'},body:JSON.stringify({sessionId:'68a4b3',location:'useStudentPlanWeekLessons.ts:queryFn',message:'hook queryFn invoked',data:{weekMondayKey:resolvedWeekMondayKey},timestamp:Date.now(),hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      return planService.getWeekLessons(referenceDate);
    },
    syncOnMount: true,
  });

  return {
    lessons: query.data ?? [],
    isInitialLoading: query.isInitialLoading,
    syncStatus: query.syncStatus,
    refresh: query.refresh,
    refetch: query.refetch,
    forceRefresh: query.forceRefresh,
    isFatalError: query.isFatalError,
  };
}
