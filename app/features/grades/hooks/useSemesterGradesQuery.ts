import type { GradesSemesterMeta } from '../../../core/scraper/features/grades/grades.service';
import {
  GradesService,
  type SemesterGrades,
} from '../../../core/scraper/features/grades/grades.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const gradesService = new GradesService();

export function useSemesterGradesQuery(
  meta: GradesSemesterMeta | null,
  enabled: boolean
) {
  const semesterNumber = meta?.semester ?? -1;

  const query = useUserPersistentQuery<SemesterGrades>({
    queryKey: (userKey) => queryKeys.grades.semester(userKey, semesterNumber),
    queryFn: () => gradesService.getSemesterGrades(meta!),
    enabled: enabled && meta != null,
    syncOnMount: true,
  });

  return {
    semesterGrades: query.data ?? null,
    syncStatus: query.syncStatus,
    isInitialLoading: query.isInitialLoading,
    hasCachedSemester: query.hasCachedData,
    refetch: query.refetch,
    forceRefresh: query.forceRefresh,
    isFatalError: query.isFatalError,
  };
}
