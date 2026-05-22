import { useQuery } from '@tanstack/react-query';

import {
  GradesService,
  type SubjectActivityDetails,
} from '../../../core/scraper/features/grades/grades.service';
import {
  EPHEMERAL_QUERY_GC_TIME_MS,
  PERSISTENT_QUERY_STALE_TIME_MS,
} from '../../../core/queryClient/persistentQueryConfig';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';

const gradesService = new GradesService();

export function usePartialGradesQuery(
  pplsId: number | null,
  enabled: boolean
) {
  const userKey = useQueryUserKey();

  return useQuery<SubjectActivityDetails[]>({
    queryKey: queryKeys.grades.partial(userKey, pplsId ?? 0),
    queryFn: () => gradesService.getPartialGrades(pplsId!),
    enabled: enabled && pplsId != null,
    staleTime: PERSISTENT_QUERY_STALE_TIME_MS,
    gcTime: EPHEMERAL_QUERY_GC_TIME_MS,
  });
}
