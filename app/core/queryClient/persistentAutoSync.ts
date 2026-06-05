import { DEFAULT_DATA_REFRESH_INTERVAL_MS } from '../preferences/dataRefreshInterval.storage';

/** Domyślny interwał auto-scrape (nadpisywany w ustawieniach). */
export const PERSISTENT_DATA_AUTO_SYNC_MS = DEFAULT_DATA_REFRESH_INTERVAL_MS;

/** Co ile sprawdzać, czy minął interwał (gdy ekran jest zamontowany). */
export const PERSISTENT_DATA_AUTO_SYNC_CHECK_MS = 60 * 1000;

export function isPersistentDataAutoSyncDue(
  dataUpdatedAt: number,
  intervalMs = PERSISTENT_DATA_AUTO_SYNC_MS,
  now = Date.now()
): boolean {
  if (dataUpdatedAt <= 0) {
    return true;
  }
  return now - dataUpdatedAt >= intervalMs;
}

/** Brak cache → zawsze sync; jest cache → sync po upływie interwału od ostatniego udanego fetcha. */
export function shouldSyncPersistentCache(
  hasCachedData: boolean,
  dataUpdatedAt: number,
  intervalMs = PERSISTENT_DATA_AUTO_SYNC_MS,
  now = Date.now()
): boolean {
  if (!hasCachedData) {
    return true;
  }
  return isPersistentDataAutoSyncDue(dataUpdatedAt, intervalMs, now);
}
