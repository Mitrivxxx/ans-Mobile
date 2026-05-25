import { getAppEnv, isDevLoggingEnabled } from './env';

/** Proste logi tylko w warstwie dev (Metro / APP_ENV=development). */
export function devLog(scope: string, message: string): void {
  if (!isDevLoggingEnabled()) {
    return;
  }
  console.log(`[WDMobile:${scope}]`, message);
}

export function devLogAppStart(): void {
  if (!isDevLoggingEnabled()) {
    return;
  }
  console.log('[WDMobile:App]', `start (env=${getAppEnv()})`);
}
