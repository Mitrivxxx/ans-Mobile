import { queryClient } from './queryClient';

const CACHE_ROOT_KEYS = new Set([
  'studentPlan',
  'grades',
  'profile',
  'announcements',
]);

function hasMeaningfulCachedData(data: unknown): boolean {
  if (data === undefined || data === null) {
    return false;
  }

  if (Array.isArray(data)) {
    return data.length > 0;
  }

  if (typeof data === 'object') {
    return Object.keys(data as object).length > 0;
  }

  return true;
}

/** Czy w cache React Query są sensowne dane użytkownika (tryb offline). */
export function hasAnyUserCache(): boolean {
  return queryClient
    .getQueryCache()
    .getAll()
    .some(
      (query) =>
        hasMeaningfulCachedData(query.state.data) &&
        typeof query.queryKey[0] === 'string' &&
        CACHE_ROOT_KEYS.has(query.queryKey[0])
    );
}

export type DegradedCacheKind = 'plan' | 'grades' | 'profile' | 'announcements';

export function getDegradedCacheKinds(): DegradedCacheKind[] {
  const kinds = new Set<DegradedCacheKind>();
  const queries = queryClient.getQueryCache().getAll();

  for (const query of queries) {
    if (!hasMeaningfulCachedData(query.state.data)) {
      continue;
    }

    const root = query.queryKey[0];
    if (root === 'studentPlan') {
      kinds.add('plan');
    } else if (root === 'grades') {
      kinds.add('grades');
    } else if (root === 'profile') {
      kinds.add('profile');
    } else if (root === 'announcements') {
      kinds.add('announcements');
    }
  }

  return Array.from(kinds);
}

export function formatDegradedCacheMessage(kinds: DegradedCacheKind[]): string {
  if (kinds.length === 0) {
    return 'Sesja WD wygasła. Wyświetlane są zapisane dane — mogą być nieaktualne.';
  }

  const labels: Record<DegradedCacheKind, string> = {
    plan: 'plan zajęć',
    grades: 'oceny',
    profile: 'profil',
    announcements: 'ogłoszenia',
  };

  const list = kinds.map((k) => labels[k]).join(', ');
  return `Sesja WD wygasła lub nie udało się jej odnowić. Działasz offline na zapisanych danych (${list}) — mogą być nieaktualne. Zaloguj się ponownie, aby odświeżyć.`;
}
