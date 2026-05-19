import {
  GradesService,
  type SemesterGrades,
} from '../../../core/scraper/features/grades/grades.service';
import { queryClient } from '../../../core/queryClient/queryClient';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const gradesService = new GradesService();
const EMPTY_SEMESTERS: SemesterGrades[] = [];

export function useGradesQuery() {
  const userKey = useQueryUserKey();

  const query = useUserPersistentQuery<SemesterGrades[]>({
    queryKey: queryKeys.grades.list,
    queryFn: () =>
      gradesService.getGrades((partial) => {
        queryClient.setQueryData(queryKeys.grades.list(userKey), partial);
      }),
    syncOnMount: true,
  });

  return {
    semesters: query.data ?? EMPTY_SEMESTERS,
    syncStatus: query.syncStatus,
    isInitialLoading: query.isInitialLoading,
    hasCachedGrades: query.hasCachedData,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
