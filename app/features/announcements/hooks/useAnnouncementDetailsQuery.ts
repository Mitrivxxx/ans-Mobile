import { useQuery } from '@tanstack/react-query';

import {
  AnnouncementsService,
  type AnnouncementDetails,
} from '../../../core/scraper/features/announcements/announcements.service';
import { cacheUntilReplaceQueryOptions } from '../../../core/queryClient/cacheUntilReplace';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import { useScrapeEnabled } from '../../../core/queryClient/useScrapeEnabled';

const announcementsService = new AnnouncementsService();

export function useAnnouncementDetailsQuery(
  announcementId: string | null,
  requestPath: string | null
) {
  const userKey = useQueryUserKey();
  const scrapeEnabled = useScrapeEnabled();

  return useQuery<AnnouncementDetails>({
    queryKey: queryKeys.announcements.detail(userKey, announcementId ?? ''),
    queryFn: () =>
      announcementsService.getAnnouncementDetails(requestPath ?? ''),
    enabled: scrapeEnabled && Boolean(announcementId && requestPath),
    ...cacheUntilReplaceQueryOptions<AnnouncementDetails>(),
  });
}
