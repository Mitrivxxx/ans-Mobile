import { getAppEnv, isDevLoggingEnabled } from './env';

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
