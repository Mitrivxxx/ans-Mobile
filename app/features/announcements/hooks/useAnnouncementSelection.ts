import { useCallback, useState } from 'react';

import { type Announcement } from '../../../core/scraper/features/announcements/announcements.service';
import { useAnnouncementDetailsQuery } from './useAnnouncementDetailsQuery';

export function useAnnouncementSelection(
  refetchAnnouncements: () => Promise<unknown>
) {
  const [selectedItem, setSelectedItem] = useState<Announcement | null>(null);

  const detailsQuery = useAnnouncementDetailsQuery(
    selectedItem?.id ?? null,
    selectedItem ? selectedItem.url || selectedItem.id : null
  );

  const selected = detailsQuery.data ?? null;
  const detailsLoading = detailsQuery.isFetching;
  const detailsError =
    detailsQuery.isError && !detailsQuery.data
      ? 'Nie udało się pobrać szczegółów ogłoszenia'
      : '';

  const refreshSelection = useCallback(async () => {
    if (selectedItem) {
      await detailsQuery.refetch();
      return;
    }
    await refetchAnnouncements();
  }, [detailsQuery, refetchAnnouncements, selectedItem]);

  const clearSelection = useCallback(() => setSelectedItem(null), []);

  return {
    selectedItem,
    setSelectedItem,
    selected,
    detailsLoading,
    detailsError,
    detailsQuery,
    refreshSelection,
    clearSelection,
  };
}
