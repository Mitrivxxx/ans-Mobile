/** Maks. wiek wpisu w AsyncStorage (~90 dni); starsze są odrzucane przy restore. */
export const PERSIST_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Wymusza odrzucenie starego cache po zmianie polityki persystencji.
 * Zmiana wartości = jednorazowa migracja u użytkowników.
 */
export const PERSIST_QUERY_BUSTER = 'v3-offline-bundle';
