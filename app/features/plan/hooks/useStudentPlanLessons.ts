import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/plan.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import { isDemoPresentationMode } from '../../../config/env';
import { getDemoMonthLessons } from '../../../demo/demoMockData';

const planService = new PlanService();

export function useStudentPlanLessons() {
  const isDemo = isDemoPresentationMode();

  const query = useUserPersistentQuery<Lesson[]>({
    queryKey: queryKeys.studentPlan.lessons,
    queryFn: () => planService.getLessons(),
    enabled: !isDemo,
  });

  if (isDemo) {
    return {
      lessons: getDemoMonthLessons(),
      isInitialLoading: false,
      hasCachedLessons: true,
      syncStatus: 'idle' as const,
      refresh: async () => {},
      refetch: async () => {},
      forceRefresh: async () => {},
      isFatalError: false,
    };
  }

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
