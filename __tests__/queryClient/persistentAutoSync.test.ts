import { describe, expect, it } from 'vitest';

import {
  isPersistentDataAutoSyncDue,
  PERSISTENT_DATA_AUTO_SYNC_MS,
  shouldSyncPersistentCache,
} from '../../app/core/queryClient/persistentAutoSync';

describe('persistentAutoSync', () => {
  const now = 1_000_000_000_000;

  it('requires sync when there is no cache', () => {
    expect(shouldSyncPersistentCache(false, now, now)).toBe(true);
  });

  it('is not due before 12h since last update', () => {
    const updatedAt = now - PERSISTENT_DATA_AUTO_SYNC_MS + 1;
    expect(isPersistentDataAutoSyncDue(updatedAt, now)).toBe(false);
    expect(shouldSyncPersistentCache(true, updatedAt, now)).toBe(false);
  });

  it('is due after 12h since last update', () => {
    const updatedAt = now - PERSISTENT_DATA_AUTO_SYNC_MS;
    expect(isPersistentDataAutoSyncDue(updatedAt, now)).toBe(true);
    expect(shouldSyncPersistentCache(true, updatedAt, now)).toBe(true);
  });

  it('treats missing dataUpdatedAt as due', () => {
    expect(isPersistentDataAutoSyncDue(0, now)).toBe(true);
  });
});
