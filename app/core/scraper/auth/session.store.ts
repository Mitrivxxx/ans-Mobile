import CookieManager from "@react-native-cookies/cookies";

import { clearCookieStore, WD_BASE_URL } from "../client/cookieStore";
import { hasAuthenticationCookie } from "../client/cookies";

import { clearSessionEstablished } from "./sessionLifetime";

export async function clearSession(): Promise<void> {
  await clearCookieStore();
  await clearSessionEstablished();
}

export async function getNativeCookieHeader(): Promise<string | null> {
  try {
    const cookies = await CookieManager.get(WD_BASE_URL);
    return Object.values(cookies)
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
  } catch {
    return null;
  }
}

export async function isSessionAuthenticated(): Promise<boolean> {
  const header = await getNativeCookieHeader();
  if (!header) return false;
  return hasAuthenticationCookie(header);
}
