import {
  PlanService,
  type Lesson,
} from '../../../core/scraper/features/plan/plan.service';
import { queryClient } from '../../../core/queryClient/queryClient';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';
import { isDemoPresentationMode } from '../../../config/env';
import { getDemoMonthLessons } from '../../../demo/demoMockData';
import { semesterLessonsOrKeepCached } from '../utils/semesterLessonsCache';

const planService = new PlanService();

export function useStudentPlanLessons() {
  const isDemo = isDemoPresentationMode();
  const userKey = useQueryUserKey();

  const query = useUserPersistentQuery<Lesson[]>({
    queryKey: queryKeys.studentPlan.lessons,
    queryFn: async () => {
      const fresh = await planService.getLessons();
      const cached = queryClient.getQueryData<Lesson[]>(
        queryKeys.studentPlan.lessons(userKey)
      );
      return semesterLessonsOrKeepCached(fresh, cached);
    },
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
