import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/plan.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const planService = new PlanService();

export function useStudentPlanLessons() {
  const query = useUserPersistentQuery<Lesson[]>({
    queryKey: queryKeys.studentPlan.lessons,
    queryFn: () => planService.getLessons(),
  });

  return {
    lessons: query.data ?? [],
    isInitialLoading: query.isInitialLoading,
    hasCachedLessons: query.hasCachedData,
    syncStatus: query.syncStatus,
    refresh: query.refresh,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
