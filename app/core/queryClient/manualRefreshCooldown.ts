/** Minimalny odstęp między ręcznymi odświeżeniami (pull-to-refresh / forceRefresh). */
export const MANUAL_REFRESH_COOLDOWN_MS = 10_000;

let lastManualRefreshAt = 0;
let batchDepth = 0;

export function canRunManualRefresh(now = Date.now()): boolean {
  return now - lastManualRefreshAt >= MANUAL_REFRESH_COOLDOWN_MS;
}

export function recordManualRefresh(now = Date.now()): void {
  lastManualRefreshAt = now;
}

export function msUntilManualRefreshAllowed(now = Date.now()): number {
  const remaining = MANUAL_REFRESH_COOLDOWN_MS - (now - lastManualRefreshAt);
  return remaining > 0 ? remaining : 0;
}

/** Jedna akcja użytkownika; zagnieżdżone wywołania (np. indeks + semestr ocen) bez drugiego cooldownu. */
export async function runWithManualRefreshCooldown(
  task: () => Promise<void>
): Promise<void> {
  if (batchDepth > 0) {
    await task();
    return;
  }

  if (!canRunManualRefresh()) {
    return;
  }

  recordManualRefresh();
  batchDepth += 1;
  try {
    await task();
  } finally {
    batchDepth -= 1;
  }
}
