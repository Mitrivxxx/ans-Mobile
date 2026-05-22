import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/plan.service';
import { getWeekMondayDateKey } from '../../../core/scraper/features/plan/plan.dateRange';
import { pruneWeekLessonsQueries } from '../../../core/queryClient/pruneWeekLessonsQueries';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import { useEffect, useMemo } from 'react';

const planService = new PlanService();

function referenceDateFromWeekMondayKey(weekMondayKey: string): Date {
  const [year, month, day] = weekMondayKey.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function useStudentPlanWeekLessons(weekMondayKey?: string) {
  const userKey = useQueryUserKey();
  const resolvedWeekMondayKey = weekMondayKey ?? getWeekMondayDateKey();
  const referenceDate = useMemo(
    () => referenceDateFromWeekMondayKey(resolvedWeekMondayKey),
    [resolvedWeekMondayKey]
  );

  useEffect(() => {
    if (!userKey) {
      return;
    }
    pruneWeekLessonsQueries(userKey, resolvedWeekMondayKey);
  }, [userKey, resolvedWeekMondayKey]);

  const query = useUserPersistentQuery<Lesson[]>({
    queryKey: (userKey) =>
      queryKeys.studentPlan.weekLessons(userKey, resolvedWeekMondayKey),
    queryFn: () => planService.getWeekLessons(referenceDate),
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
