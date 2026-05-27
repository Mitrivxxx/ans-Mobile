import type { Query } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import {
  isOfflinePersistQuery,
  shouldDehydratePersistedQuery,
} from '../../app/core/queryClient/shouldPersistQuery';

function mockQuery(queryKey: unknown, status: 'success' | 'pending' = 'success', data?: unknown): Query {
  return {
    queryKey,
    state: { status, data },
  } as Query;
}

describe('shouldPersistQuery', () => {
  it('persists semester plan (sidebar Plan)', () => {
    const key = ['studentPlan', 'user1', 'lessons'] as const;
    expect(isOfflinePersistQuery(mockQuery(key))).toBe(true);
    expect(
      shouldDehydratePersistedQuery(mockQuery(key, 'success', [{ subject: 'x' }]))
    ).toBe(true);
  });

  it('does not persist pending semester plan', () => {
    const key = ['studentPlan', 'user1', 'lessons'] as const;
    expect(shouldDehydratePersistedQuery(mockQuery(key, 'pending'))).toBe(false);
  });
});
