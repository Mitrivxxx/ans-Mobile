/** Ikona priorytetu z listy WD (`svg[data-icon]`). */
export type AnnouncementListIcon =
  | 'exclamation'
  | 'triangle-exclamation'
  | 'circle-info';

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
  /** Na liście WD: drugi slot w wierszu tytułu ma zagnieżdżony div, gdy jest załącznik. */
  hasAttachment: boolean;
  /** Kolor paska: exclamation — czerwony, triangle-exclamation — żółty, circle-info — niebieski. */
  listIcon: AnnouncementListIcon | null;
}
