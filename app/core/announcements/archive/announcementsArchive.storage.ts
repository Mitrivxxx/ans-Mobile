import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Announcement,
  AnnouncementDetails,
} from '../../scraper/features/announcements/announcements.types';
import {
  ANNOUNCEMENTS_ARCHIVE_RETENTION_MS,
  ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION,
} from './announcementsArchive.constants';
import type {
  AnnouncementsArchiveStore,
  ArchivedAnnouncement,
} from './announcementsArchive.types';

function storageKey(userKey: string): string {
  return `announcements.archive.v${ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION}:${userKey}`;
}

function isExpired(savedAt: number, now = Date.now()): boolean {
  return now - savedAt > ANNOUNCEMENTS_ARCHIVE_RETENTION_MS;
}

function purgeExpiredItems(
  items: ArchivedAnnouncement[],
  now = Date.now()
): ArchivedAnnouncement[] {
  return items.filter((item) => !isExpired(item.savedAt, now));
}

async function readStore(userKey: string): Promise<AnnouncementsArchiveStore> {
  const raw = await AsyncStorage.getItem(storageKey(userKey));
  if (!raw) {
    return { version: ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION, items: [] };
  }

  try {
    const parsed = JSON.parse(raw) as AnnouncementsArchiveStore;
    if (parsed.version !== ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION) {
      return { version: ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION, items: [] };
    }
    const items = purgeExpiredItems(parsed.items ?? []);
    return { version: ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION, items };
  } catch {
    return { version: ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION, items: [] };
  }
}

async function writeStore(
  userKey: string,
  items: ArchivedAnnouncement[]
): Promise<void> {
  const store: AnnouncementsArchiveStore = {
    version: ANNOUNCEMENTS_ARCHIVE_STORAGE_VERSION,
    items: purgeExpiredItems(items),
  };
  await AsyncStorage.setItem(storageKey(userKey), JSON.stringify(store));
}

export async function loadAnnouncementsArchive(
  userKey: string
): Promise<ArchivedAnnouncement[]> {
  const store = await readStore(userKey);
  const items = purgeExpiredItems(store.items);
  if (items.length !== store.items.length) {
    await writeStore(userKey, items);
  }
  return items.sort((a, b) => b.savedAt - a.savedAt);
}

export async function saveAnnouncementToArchive(
  userKey: string,
  announcement: Announcement,
  details: AnnouncementDetails
): Promise<ArchivedAnnouncement[]> {
  const store = await readStore(userKey);
  const savedAt = Date.now();
  const entry: ArchivedAnnouncement = {
    id: announcement.id,
    title: announcement.title,
    url: announcement.url,
    authorName: details.authorName || announcement.authorName,
    date: details.date || announcement.date,
    content: details.content,
    savedAt,
  };

  const withoutDuplicate = store.items.filter((item) => item.id !== announcement.id);
  const items = purgeExpiredItems([entry, ...withoutDuplicate]);
  await writeStore(userKey, items);
  return items.sort((a, b) => b.savedAt - a.savedAt);
}

export async function removeAnnouncementFromArchive(
  userKey: string,
  announcementId: string
): Promise<ArchivedAnnouncement[]> {
  const store = await readStore(userKey);
  const items = store.items.filter((item) => item.id !== announcementId);
  await writeStore(userKey, items);
  return items.sort((a, b) => b.savedAt - a.savedAt);
}

export async function clearAnnouncementsArchive(userKey: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userKey));
}
