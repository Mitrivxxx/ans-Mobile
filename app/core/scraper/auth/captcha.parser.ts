import { WD_BASE_URL } from "../client/client";

import type { LoginResult } from "./auth.types";

export function isCaptchaRequiredInHtml(html: string): boolean {
  const hints =
    /name=["']captcha["']/i.test(html) ||
    /id=["']captchaImg["']/i.test(html) ||
    /\/Shared\/Captcha\?/i.test(html) ||
    /data-valmsg-for=["']captcha["']/i.test(html) ||
    /data-valmsg-for=["']Captcha["']/i.test(html) ||
    /wpisz kod z obrazka/i.test(html) ||
    /nieprawidłowy kod z obrazka/i.test(html) ||
    /nieprawidlowy kod z obrazka/i.test(html);

  if (!hints) return false;

  return (
    /name=["']Username["']/i.test(html) ||
    /name=["']Password["']/i.test(html) ||
    /action=["'][^"']*Logowanie/i.test(html)
  );
}

export function resolveCaptchaImageUrl(html: string): string | null {
  const img =
    html.match(/id=["']captchaImg["'][^>]*\ssrc=["']([^"']+)["']/i) ??
    html.match(/id=["']captchaImg["'][^>]*src=["']([^"']+)["']/i);
  if (img?.[1]) {
    const src = img[1].replace(/&amp;/g, "&");
    if (/^https?:\/\//i.test(src)) return src;
    return WD_BASE_URL + (src.startsWith("/") ? src : `/${src}`);
  }
  const sh = html.match(/src=["'](\/Shared\/Captcha[^"']*)["']/i);
  if (sh?.[1]) {
    return WD_BASE_URL + sh[1].replace(/&amp;/g, "&");
  }
  return null;
}

export function extractGsf(html: string): string | null {
  const patterns = [
    /name=["']gsf["'][^>]*value=["']([^"']*)["']/i,
    /name=["']gsf["'][^>]*value="([^"]*)"/i,
    /value=["']([^"']*)["'][^>]*name=["']gsf["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] !== undefined) return m[1];
  }
  return null;
}

export function buildCaptchaRequiredResult(
  html: string,
  baseError?: string
): LoginResult {
  return {
    success: false,
    requiresCaptcha: true,
    continuationHtml: html,
    captchaImageUrl: resolveCaptchaImageUrl(html),
    error: baseError ?? "Wymagana weryfikacja CAPTCHA — wpisz kod z obrazka.",
  };
}

export function appendCaptchaFields(
  formData: URLSearchParams,
  loginPageHtml: string,
  captcha?: string
): void {
  const wantsCaptcha =
    isCaptchaRequiredInHtml(loginPageHtml) || Boolean(captcha?.trim());

  if (!wantsCaptcha) return;

  const gsf = extractGsf(loginPageHtml);
  if (gsf !== null && gsf !== "") {
    formData.append("gsf", gsf);
  }
  if (captcha?.trim()) {
    formData.append("captcha", captcha.trim());
  }
}
