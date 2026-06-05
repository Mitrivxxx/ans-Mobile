import { describe, expect, it } from 'vitest';

import {
  isPersistentDataAutoSyncDue,
  PERSISTENT_DATA_AUTO_SYNC_MS,
  shouldSyncPersistentCache,
} from '../../app/core/queryClient/persistentAutoSync';

describe('persistentAutoSync', () => {
  const now = 1_000_000_000_000;
  const oneHourMs = 60 * 60 * 1000;

  it('requires sync when there is no cache', () => {
    expect(shouldSyncPersistentCache(false, now, oneHourMs, now)).toBe(true);
  });

  it('is not due before interval since last update', () => {
    const updatedAt = now - oneHourMs + 1;
    expect(isPersistentDataAutoSyncDue(updatedAt, oneHourMs, now)).toBe(false);
    expect(shouldSyncPersistentCache(true, updatedAt, oneHourMs, now)).toBe(
      false
    );
  });

  it('is due after default interval since last update', () => {
    const updatedAt = now - PERSISTENT_DATA_AUTO_SYNC_MS;
    expect(isPersistentDataAutoSyncDue(updatedAt, PERSISTENT_DATA_AUTO_SYNC_MS, now)).toBe(true);
    expect(
      shouldSyncPersistentCache(true, updatedAt, PERSISTENT_DATA_AUTO_SYNC_MS, now)
    ).toBe(true);
  });

  it('treats missing dataUpdatedAt as due', () => {
    expect(isPersistentDataAutoSyncDue(0, now)).toBe(true);
  });
});
