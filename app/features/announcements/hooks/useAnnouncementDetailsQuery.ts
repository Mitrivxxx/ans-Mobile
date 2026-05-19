import { useQuery } from '@tanstack/react-query';

import {
  AnnouncementsService,
  type AnnouncementDetails,
} from '../../../core/scraper/features/announcements/announcements.service';
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
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}
