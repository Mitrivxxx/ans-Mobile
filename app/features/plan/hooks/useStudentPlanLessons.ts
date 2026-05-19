import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/paln.service';
import { createPersistentQueryHook } from '../../../core/queryClient/createPersistentQueryHook';
import { queryKeys } from '../../../core/queryClient/queryKeys';

const planService = new PlanService();

const useStudentPlanLessonsQuery = createPersistentQueryHook<Lesson[]>({
  queryKey: queryKeys.studentPlan.lessons,
  queryFn: () => planService.getLessons(),
});

export function useStudentPlanLessons() {
  const query = useStudentPlanLessonsQuery();

  return {
    lessons: query.data ?? [],
    isInitialLoading: query.isInitialLoading,
    hasCachedLessons: query.hasCachedData,
    syncStatus: query.syncStatus,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
