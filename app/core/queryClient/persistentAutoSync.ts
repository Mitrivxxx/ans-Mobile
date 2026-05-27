/** Automatyczne odświeżenie danych z cache (sidebar, dashboard, plan). */
export const PERSISTENT_DATA_AUTO_SYNC_MS = 12 * 60 * 60 * 1000;

/** Co ile sprawdzać, czy minął interwał (gdy ekran jest zamontowany). */
export const PERSISTENT_DATA_AUTO_SYNC_CHECK_MS = 60 * 1000;

export function isPersistentDataAutoSyncDue(
  dataUpdatedAt: number,
  now = Date.now()
): boolean {
  if (dataUpdatedAt <= 0) {
    return true;
  }
  return now - dataUpdatedAt >= PERSISTENT_DATA_AUTO_SYNC_MS;
}

/** Brak cache → zawsze sync; jest cache → sync po upływie interwału od ostatniego udanego fetcha. */
export function shouldSyncPersistentCache(
  hasCachedData: boolean,
  dataUpdatedAt: number,
  now = Date.now()
): boolean {
  if (!hasCachedData) {
    return true;
  }
  return isPersistentDataAutoSyncDue(dataUpdatedAt, now);
}
