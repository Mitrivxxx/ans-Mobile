import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/paln.service';
import { createPersistentQueryHook } from '../../../core/queryClient/createPersistentQueryHook';
import { queryKeys } from '../../../core/queryClient/queryKeys';

const planService = new PlanService();

const useStudentPlanWeekLessonsQuery = createPersistentQueryHook<Lesson[]>({
  queryKey: queryKeys.studentPlan.weekLessons,
  queryFn: () => planService.getWeekLessons(),
  syncOnMount: true,
});

export function useStudentPlanWeekLessons() {
  const query = useStudentPlanWeekLessonsQuery();

  return {
    lessons: query.data ?? [],
    isInitialLoading: query.isInitialLoading,
    syncStatus: query.syncStatus,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
