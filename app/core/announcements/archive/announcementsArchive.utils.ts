import type { AnnouncementDetails } from '../../scraper/features/announcements/announcements.types';
import type { ArchivedAnnouncement } from './announcementsArchive.types';

export function archivedAnnouncementToDetails(
  item: ArchivedAnnouncement
): AnnouncementDetails {
  return {
    content: item.content,
    authorName: item.authorName,
    date: item.date,
  };
}
