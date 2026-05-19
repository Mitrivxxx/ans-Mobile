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
    queryFn: () => announcementsService.getAnnouncements(),
    syncOnMount: true,
  });

  return {
    announcements: query.data ?? [],
    syncStatus: query.syncStatus,
    isInitialLoading: query.isInitialLoading,
    hasCachedAnnouncements: query.hasCachedData,
    refetch: query.refetch,
    isFatalError: query.isFatalError,
  };
}
