import type { Announcement } from '../../../core/scraper/features/announcements/announcements.service';
import { parseAnnouncementDate } from './announcementDate';

/** Zwraca `limit` najnowszych ogłoszeń (malejąco po dacie, potem kolejność z listy WD). */
export function takeLatestAnnouncements(
  items: Announcement[],
  limit: number
): Announcement[] {
  if (limit <= 0 || items.length === 0) {
    return [];
  }

  return items
    .map((item, index) => ({
      item,
      index,
      time: parseAnnouncementDate(item.date)?.getTime() ?? null,
    }))
    .sort((a, b) => {
      if (a.time !== null && b.time !== null) {
        return b.time - a.time;
      }
      if (a.time !== null) {
        return -1;
      }
      if (b.time !== null) {
        return 1;
      }
      return a.index - b.index;
    })
    .slice(0, limit)
    .map(({ item }) => item);
}
