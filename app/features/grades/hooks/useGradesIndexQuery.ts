import {
  GradesService,
  type GradesIndex,
} from '../../../core/scraper/features/grades/grades.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const gradesService = new GradesService();

export function useGradesIndexQuery() {
  const query = useUserPersistentQuery<GradesIndex>({
    queryKey: queryKeys.grades.index,
    queryFn: () => gradesService.getGradesIndex(),
    syncOnMount: true,
  });

  return {
    index: query.data ?? null,
    syncStatus: query.syncStatus,
    isInitialLoading: query.isInitialLoading,
    hasCachedIndex: query.hasCachedData,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
