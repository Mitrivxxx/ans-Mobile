import type { SyncStatus } from './syncTypes';

/** Łączy statusy wielu zapytań persistent (np. indeks + semestr ocen). */
export function mergeSyncStatuses(...statuses: SyncStatus[]): SyncStatus {
  if (statuses.some((status) => status === 'loading')) {
    return 'loading';
  }
  if (statuses.some((status) => status === 'error')) {
    return 'error';
  }
  if (statuses.length > 0 && statuses.every((status) => status === 'upToDate')) {
    return 'upToDate';
  }
  return 'idle';
}
