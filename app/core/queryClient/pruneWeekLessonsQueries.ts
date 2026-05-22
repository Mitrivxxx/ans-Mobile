import type { Query } from '@tanstack/react-query';

import { queryClient } from './queryClient';

function isWeekLessonsQueryForUser(
  query: Query,
  userKey: string
): boolean {
  const key = query.queryKey;
  return (
    Array.isArray(key) &&
    key[0] === 'studentPlan' &&
    key[1] === userKey &&
    key[2] === 'weekLessons' &&
    typeof key[3] === 'string'
  );
}

/**
 * W RAM zostaje co najwyżej jeden tydzień planu (aktywny weekMondayKey).
 * Przy rotacji w poniedziałek usuwa poprzedni „bieżący” tydzień z cache RQ.
 */
export function pruneWeekLessonsQueries(
  userKey: string,
  keepWeekMondayKey: string
): void {
  queryClient.removeQueries({
    predicate: (query) => {
      if (!isWeekLessonsQueryForUser(query, userKey)) {
        return false;
      }
      return query.queryKey[3] !== keepWeekMondayKey;
    },
  });
}
