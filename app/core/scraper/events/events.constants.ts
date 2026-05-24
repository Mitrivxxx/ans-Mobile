export const ANS_WEB_ORIGIN = 'https://www.ans-ns.edu.pl';

/** Automatyczne odświeżanie listy wydarzeń — bez ręcznego pull-to-refresh. */
export const EVENTS_STALE_TIME_MS = 24 * 60 * 60 * 1000;

/** Opóźnienie pierwszego scrape — niższy priorytet niż harmonogram / oceny. */
export const EVENTS_SCRAPE_DELAY_MS = 3_000;

export const EVENTS_MONTH_LABELS_UPPER = [
  'STYCZNIA',
  'LUTEGO',
  'MARCA',
  'KWIETNIA',
  'MAJA',
  'CZERWCA',
  'LIPCA',
  'SIERPNIA',
  'WRZEŚNIA',
  'PAŹDZIERNIKA',
  'LISTOPADA',
  'GRUDNIA',
] as const;
