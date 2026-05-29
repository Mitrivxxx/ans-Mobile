import { clearLocalUserSessionData } from './clearLocalUserSessionData';

export async function performSignOut(): Promise<void> {
  await clearLocalUserSessionData();
}
