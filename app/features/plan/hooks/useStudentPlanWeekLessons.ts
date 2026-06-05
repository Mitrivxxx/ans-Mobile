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
    queryFn: () => planService.getWeekLessons(referenceDate),
    syncOnMount: true,
  });

  return {
    lessons: query.data ?? [],
    isInitialLoading: query.isInitialLoading,
    hasCachedLessons: query.hasCachedData,
    syncStatus: query.syncStatus,
    refresh: query.refresh,
    refetch: query.refetch,
    forceRefresh: query.forceRefresh,
    isFatalError: query.isFatalError,
  };
}
