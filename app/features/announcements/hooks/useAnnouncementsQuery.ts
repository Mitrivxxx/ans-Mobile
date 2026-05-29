import { useMemo } from 'react';

import { normalizeAnnouncement } from '../../../core/scraper/features/announcements/announcements.parse';
import {
  AnnouncementsService,
  type Announcement,
} from '../../../core/scraper/features/announcements/announcements.service';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useUserPersistentQuery } from '../../../core/queryClient/useUserPersistentQuery';

const announcementsService = new AnnouncementsService();

export function useAnnouncementsQuery() {
  const query = useUserPersistentQuery<Announcement[]>({
    queryKey: queryKeys.announcements.list,
    queryFn: async () => {
      const list = await announcementsService.getAnnouncements();
      return list.map((item) => normalizeAnnouncement(item));
    },
    syncOnMount: true,
  });

  const announcements = useMemo(
    () => (query.data ?? []).map((item) => normalizeAnnouncement(item)),
    [query.data]
  );

  return {
    announcements,
    syncStatus: query.syncStatus,
    isInitialLoading: query.isInitialLoading,
    hasCachedAnnouncements: query.hasCachedData,
    refetch: query.refetch,
    forceRefresh: query.forceRefresh,
    isFatalError: query.isFatalError,
  };
}
