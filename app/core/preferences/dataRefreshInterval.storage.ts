import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA_REFRESH_INTERVAL_MS_KEY = '@wdmobile/dataRefreshIntervalMs';

export const DATA_REFRESH_INTERVAL_OPTIONS = [
  { id: '15m', label: '15 minut', ms: 15 * 60 * 1000 },
  { id: '30m', label: '30 minut', ms: 30 * 60 * 1000 },
  { id: '1h', label: '1 godzina', ms: 60 * 60 * 1000 },
  { id: '2h', label: '2 godziny', ms: 2 * 60 * 60 * 1000 },
  { id: '4h', label: '4 godziny', ms: 4 * 60 * 60 * 1000 },
  { id: '8h', label: '8 godzin', ms: 8 * 60 * 60 * 1000 },
  { id: '12h', label: '12 godzin', ms: 12 * 60 * 60 * 1000 },
  { id: '24h', label: '24 godziny', ms: 24 * 60 * 60 * 1000 },
] as const;

export type DataRefreshIntervalId =
  (typeof DATA_REFRESH_INTERVAL_OPTIONS)[number]['id'];

/** Domyślny interwał auto-scrape (wcześniej hardcoded 12h w kodzie). */
export const DEFAULT_DATA_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

const ALLOWED_MS = new Set(
  DATA_REFRESH_INTERVAL_OPTIONS.map((option) => option.ms)
);

export function isAllowedDataRefreshIntervalMs(ms: number): boolean {
  return ALLOWED_MS.has(ms);
}

export function getDataRefreshIntervalOptionByMs(
  ms: number
): (typeof DATA_REFRESH_INTERVAL_OPTIONS)[number] | undefined {
  return DATA_REFRESH_INTERVAL_OPTIONS.find((option) => option.ms === ms);
}

export async function getDataRefreshIntervalMs(): Promise<number> {
  const raw = await AsyncStorage.getItem(DATA_REFRESH_INTERVAL_MS_KEY);
  if (!raw) {
    return DEFAULT_DATA_REFRESH_INTERVAL_MS;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || !isAllowedDataRefreshIntervalMs(parsed)) {
    return DEFAULT_DATA_REFRESH_INTERVAL_MS;
  }

  return parsed;
}

export async function setDataRefreshIntervalMs(ms: number): Promise<void> {
  if (!isAllowedDataRefreshIntervalMs(ms)) {
    throw new Error('Nieobsługiwany interwał odświeżania danych');
  }

  await AsyncStorage.setItem(DATA_REFRESH_INTERVAL_MS_KEY, String(ms));
}
