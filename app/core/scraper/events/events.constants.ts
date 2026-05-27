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

export const EVENTS_DEPARTMENTS = [
  {
    id: 'general',
    label: 'Ogólny',
    path: '/',
    panelColor: null,
  },
  {
    id: 'we',
    label: 'Nauk Ekonomicznych',
    path: '/we',
    panelColor: '#306138',
  },
  {
    id: 'wh',
    label: 'Nauk Humanistycznych',
    path: '/wh',
    panelColor: '#8A7500',
  },
  {
    id: 'wkfb',
    label: 'Nauk o Kulturze Fizycznej i Bezpieczeństwie',
    path: '/wkfb',
    panelColor: '#325F80',
  },
  {
    id: 'wss',
    label: 'Nauk Społecznych i Sztuki',
    path: '/wss',
    panelColor: '#794472',
  },
  {
    id: 'wi',
    label: 'Nauk Inżynieryjnych',
    path: '/wi',
    panelColor: '#2D4174',
  },
  {
    id: 'wz',
    label: 'Lekarski i Nauk o Zdrowiu',
    path: '/wz',
    panelColor: '#BD3C52',
  },
] as const;

export type EventsDepartmentId = (typeof EVENTS_DEPARTMENTS)[number]['id'];
