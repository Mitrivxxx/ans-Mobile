/** Cache traktowany jako świeży — brak syncu przy focusie między odświeżeniami. */
export const PERSISTENT_QUERY_STALE_TIME_MS = 6 * 60 * 60 * 1000;

/** Domyślny interwał tła (gdy włączony); zwykle = staleTime. */
export const PERSISTENT_QUERY_REFETCH_INTERVAL_MS =
  PERSISTENT_QUERY_STALE_TIME_MS;

/** Maks. wiek zapisu persist w AsyncStorage (14 dni). */
export const PERSIST_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
