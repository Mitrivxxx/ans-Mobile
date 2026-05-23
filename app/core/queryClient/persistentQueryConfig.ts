/** Zapis persist w AsyncStorage — bez limitu czasu (tylko logout / buster). */
export const PERSIST_MAX_AGE_MS = Number.POSITIVE_INFINITY;

/**
 * Wymusza odrzucenie starego cache po zmianie polityki persystencji.
 * Zmiana wartości = jednorazowa migracja u użytkowników.
 */
export const PERSIST_QUERY_BUSTER = 'v2-offline-bundle';
