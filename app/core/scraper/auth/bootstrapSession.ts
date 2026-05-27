import { devLog } from '../../../config/devLog';
import { setupScraperAuthGuard } from './ensureAuthenticated';
import { initClient } from '../client/client';

let scraperInfraInFlight: Promise<void> | null = null;
let scraperInfraReady = false;

/**
 * Inicjalizuje infrastrukturę scrapera (guard + klient/cookies) tylko raz na start.
 * Równoległe wywołania współdzielą ten sam Promise.
 */
export async function ensureScraperInfraReady(): Promise<void> {
  if (scraperInfraReady) {
    return;
  }

  if (!scraperInfraInFlight) {
    scraperInfraInFlight = (async () => {
      setupScraperAuthGuard();
      await initClient();
      scraperInfraReady = true;
      devLog('Init', 'scraper infra ready');
    })().finally(() => {
      scraperInfraInFlight = null;
    });
  }

  await scraperInfraInFlight;
}
