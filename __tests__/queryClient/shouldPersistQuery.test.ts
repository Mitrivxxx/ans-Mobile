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

  it('persists semester grades and skips partial grades', () => {
    const semesterKey = ['grades', 'user1', 'semester', 3] as const;
    const partialKey = ['grades', 'user1', 'partial', 10] as const;
    expect(isOfflinePersistQuery(mockQuery(semesterKey))).toBe(true);
    expect(
      shouldDehydratePersistedQuery(
        mockQuery(semesterKey, 'success', { subjects: [] })
      )
    ).toBe(true);
    expect(isOfflinePersistQuery(mockQuery(partialKey))).toBe(false);
  });

  it('persists student groups for profile semester', () => {
    const key = ['profile', 'user1', 'groups', '2025/2026 Z'] as const;
    expect(isOfflinePersistQuery(mockQuery(key))).toBe(true);
    expect(
      shouldDehydratePersistedQuery(
        mockQuery(key, 'success', { academicSemester: '2025/2026 Z', groups: [] })
      )
    ).toBe(true);
  });
});
