/** Ogłoszenie z pełną treścią zapisane lokalnie (archiwum użytkownika). */
export type ArchivedAnnouncement = {
  id: string;
  title: string;
  url: string;
  authorName: string;
  date: string;
  content: string;
  /** Unix ms — od tego momentu liczy się 6 miesięcy przechowywania. */
  savedAt: number;
};

export type AnnouncementsArchiveStore = {
  version: 1;
  items: ArchivedAnnouncement[];
};
