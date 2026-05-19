const COOLDOWN_MS = 5 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 3;

let attemptTimestamps: number[] = [];

function pruneAttempts(now: number): void {
  attemptTimestamps = attemptTimestamps.filter((t) => now - t < WINDOW_MS);
}

export function canAttemptSilentLogin(): boolean {
  const now = Date.now();
  pruneAttempts(now);

  if (attemptTimestamps.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return false;
  }

  const last = attemptTimestamps[attemptTimestamps.length - 1];
  if (last != null && now - last < COOLDOWN_MS) {
    return false;
  }

  return true;
}

export function recordSilentLoginAttempt(): void {
  attemptTimestamps.push(Date.now());
}

export function getSilentLoginBlockedMessage(): string {
  return 'Zbyt wiele prób automatycznego logowania. Zaloguj się ręcznie za kilka minut.';
}

export function resetSilentLoginLimiter(): void {
  attemptTimestamps = [];
}
