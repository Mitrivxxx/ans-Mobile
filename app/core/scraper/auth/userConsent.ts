import CookieManager from "@react-native-cookies/cookies";

import { flushCookieWrites } from "../client/client";
import {
  mergeCookieHeader,
  WD_BASE_URL,
} from "../client/cookieStore";

/** Wartość jak po akceptacji zgód na /WyborKontekstu (portal bez tego ciasteczka odrzuca sesję). */
export const WD_USER_CONSENT_VALUE =
  '{"cc_essential":true,"cc_functional":true,"cc_analytics":true,"essentialCookies":true}';

export const WD_USER_CONSENT_NAME = ".user-consent";

export function hasWdUserConsentCookie(cookieHeader: string): boolean {
  return /(?:^|;)\s*\.user-consent=/i.test(cookieHeader);
}

/**
 * Portal WD wymaga `.user-consent` przy kontach z wyborem kontekstu (np. Student).
 * Przeglądarka ustawia je na stronie wyboru; scraper musi wysłać je sam.
 */
export async function ensureWdUserConsentCookie(): Promise<void> {
  const pair = `${WD_USER_CONSENT_NAME}=${WD_USER_CONSENT_VALUE}`;
  await mergeCookieHeader(pair);

  try {
    await CookieManager.set(WD_BASE_URL, {
      name: WD_USER_CONSENT_NAME,
      value: WD_USER_CONSENT_VALUE,
      path: "/",
      secure: true,
    });
  } catch {
    /* CookieManager — pojedyncze ciasteczko */
  }

  await flushCookieWrites();
}
