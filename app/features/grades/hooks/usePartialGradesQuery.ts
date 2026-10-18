import { useQuery } from '@tanstack/react-query';

import {
  GradesService,
  type SubjectActivityDetails,
} from '../../../core/scraper/features/grades/grades.service';
import { cacheUntilReplaceQueryOptions } from '../../../core/queryClient/cacheUntilReplace';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useScrapeEnabled } from '../../../core/queryClient/useScrapeEnabled';

const gradesService = new GradesService();

export function usePartialGradesQuery(
  pplsId: number | null,
  enabled: boolean
) {
  const userKey = useQueryUserKey();
  const scrapeEnabled = useScrapeEnabled();

  return useQuery<SubjectActivityDetails[]>({
    queryKey: queryKeys.grades.partial(userKey, pplsId ?? 0),
    queryFn: () => gradesService.getPartialGrades(pplsId!),
    enabled: enabled && scrapeEnabled && pplsId != null,
    ...cacheUntilReplaceQueryOptions<SubjectActivityDetails[]>(),
  });
}
