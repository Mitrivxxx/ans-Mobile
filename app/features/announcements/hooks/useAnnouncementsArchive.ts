import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { AnnouncementsService } from '../../../core/scraper/features/announcements/announcements.service';
import type { Announcement } from '../../../core/scraper/features/announcements/announcements.types';
import { queryClient } from '../../../core/queryClient/queryClient';
import { queryKeys } from '../../../core/queryClient/queryKeys';
import { useQueryUserKey } from '../../../core/queryClient/useQueryUserKey';
import type { ArchivedAnnouncement } from '../../../core/announcements/archive/announcementsArchive.types';
import {
  loadAnnouncementsArchive,
  removeAnnouncementFromArchive,
  saveAnnouncementToArchive,
} from '../../../core/announcements/archive/announcementsArchive.storage';

const announcementsService = new AnnouncementsService();

export function useAnnouncementsArchive() {
  const userKey = useQueryUserKey();
  const [archived, setArchived] = useState<ArchivedAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userKey) {
      setArchived([]);
      return;
    }
    const items = await loadAnnouncementsArchive(userKey);
    setArchived(items);
  }, [userKey]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void loadAnnouncementsArchive(userKey)
      .then((items) => {
        if (!cancelled) {
          setArchived(items);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userKey]);

  const archivedIds = useMemo(
    () => new Set(archived.map((item) => item.id)),
    [archived]
  );

  const isArchived = useCallback(
    (announcementId: string) => archivedIds.has(announcementId),
    [archivedIds]
  );

  const removeFromArchive = useCallback(
    async (announcementId: string) => {
      if (!userKey || removingId) {
        return;
      }
      setRemovingId(announcementId);
      try {
        const items = await removeAnnouncementFromArchive(userKey, announcementId);
        setArchived(items);
      } finally {
        setRemovingId(null);
      }
    },
    [removingId, userKey]
  );

  const addToArchive = useCallback(
    async (announcement: Announcement) => {
      if (!userKey || archivingId) {
        return;
      }

      if (archivedIds.has(announcement.id)) {
        await removeFromArchive(announcement.id);
        return;
      }

      setArchivingId(announcement.id);
      try {
        const cached = queryClient.getQueryData<{
          content: string;
          authorName: string;
          date: string;
        }>(queryKeys.announcements.detail(userKey, announcement.id));

        const details =
          cached ??
          (await announcementsService.getAnnouncementDetails(
            announcement.url || announcement.id
          ));

        const items = await saveAnnouncementToArchive(
          userKey,
          announcement,
          details
        );
        setArchived(items);
      } catch {
        Alert.alert(
          'Archiwum',
          'Nie udało się zapisać ogłoszenia. Sprawdź połączenie z internetem i spróbuj ponownie.'
        );
      } finally {
        setArchivingId(null);
      }
    },
    [archivedIds, archivingId, removeFromArchive, userKey]
  );

  const toggleArchive = useCallback(
    async (announcement: Announcement) => {
      if (archivedIds.has(announcement.id)) {
        await removeFromArchive(announcement.id);
        return;
      }
      await addToArchive(announcement);
    },
    [addToArchive, archivedIds, removeFromArchive]
  );

  return {
    archived,
    archivedIds,
    isLoading,
    archivingId,
    removingId,
    isArchived,
    addToArchive,
    removeFromArchive,
    toggleArchive,
    reload,
  };
}
