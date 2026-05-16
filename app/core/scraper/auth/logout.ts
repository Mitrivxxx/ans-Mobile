import { showCookies } from "../client/cookies";

import { clearSession } from "./session.store";

export async function logout(): Promise<void> {
  try {
    await clearSession();
  } catch {
    /* ignore */
  }
  await showCookies("po wylogowaniu");
}
