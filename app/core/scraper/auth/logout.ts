import { clearSession } from "./session.store";

export async function logout(): Promise<void> {
  try {
    await clearSession();
  } catch {
    /* ignore */
  }
}
