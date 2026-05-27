export interface AnnouncementDetails {
  content: string;
  authorName: string;
  date: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
}

export interface Announcement {
  title: string;
  url: string;
  id: string;
  authorName: string;
  date: string;
}
