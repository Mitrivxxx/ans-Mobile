/** Vitest (Node) — brak globali React Native / Expo z Metro. */
(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = false;
