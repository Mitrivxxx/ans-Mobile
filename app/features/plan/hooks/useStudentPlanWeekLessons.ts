import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/plan.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const planService = new PlanService();

export function useStudentPlanWeekLessons() {
  const query = useUserPersistentQuery<Lesson[]>({
    queryKey: queryKeys.studentPlan.weekLessons,
    queryFn: () => planService.getWeekLessons(),
    syncOnMount: true,
  });

  return {
    lessons: query.data ?? [],
    isInitialLoading: query.isInitialLoading,
    syncStatus: query.syncStatus,
    refresh: query.refresh,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
