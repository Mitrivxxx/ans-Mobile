import { useQuery } from '@tanstack/react-query';

import {
  AnnouncementsService,
  type AnnouncementDetails,
} from '../../../core/scraper/features/announcements/announcements.service';
import {
  EPHEMERAL_QUERY_GC_TIME_MS,
  PERSISTENT_QUERY_STALE_TIME_MS,
} from '../../../core/queryClient/persistentQueryConfig';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';

const announcementsService = new AnnouncementsService();

export function useAnnouncementDetailsQuery(
  announcementId: string | null,
  requestPath: string | null
) {
  const userKey = useQueryUserKey();

  return useQuery<AnnouncementDetails>({
    queryKey: queryKeys.announcements.detail(userKey, announcementId ?? ''),
    queryFn: () =>
      announcementsService.getAnnouncementDetails(requestPath ?? ''),
    enabled: Boolean(announcementId && requestPath),
    staleTime: PERSISTENT_QUERY_STALE_TIME_MS,
    gcTime: EPHEMERAL_QUERY_GC_TIME_MS,
  });
}
