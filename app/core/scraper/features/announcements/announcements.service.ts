import {
  parseAnnouncementDetails,
  parseAnnouncements,
} from "./announcements.parse";
import {
  fetchAnnouncementDetails,
  fetchAnnouncementsPage,
} from "./announcements.fetch";
import type { Announcement, AnnouncementDetails } from "./announcements.types";

export class AnnouncementsService {
  async getAnnouncements(): Promise<Announcement[]> {
    const html = await fetchAnnouncementsPage();
    return parseAnnouncements(html);
  }

  async getAnnouncementDetails(
    urlOrId: string
  ): Promise<AnnouncementDetails> {
    const html = await fetchAnnouncementDetails(urlOrId);
    return parseAnnouncementDetails(html);
  }
}

export type { Announcement, AnnouncementDetails } from "./announcements.types";
