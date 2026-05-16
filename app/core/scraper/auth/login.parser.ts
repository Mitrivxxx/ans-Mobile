import type { AxiosResponse } from "axios";

import { getCookies as getAxiosCookieHeader } from "../client/client";
import { hasAuthenticationCookie } from "../client/cookies";

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isLoginFormHtml(html: string): boolean {
  return (
    /name=["']Username["']/i.test(html) &&
    /name=["']Password["']/i.test(html) &&
    /__RequestVerificationToken/i.test(html)
  );
}

export function extractMvcLoginErrorSummary(html: string): string | null {
  const summary = html.match(
    /class=["']validation-summary-errors["'][^>]*>([\s\S]*?)<\/ul>/i
  );
  if (summary?.[1]) {
    const items = [...summary[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) => stripTags(m[1]))
      .filter((t) => t.length > 2 && t.length < 400);
    if (items.length) return items.join(" ");
  }

  const spans = [
    ...html.matchAll(
      /<span[^>]*class=["'][^"']*field-validation-error[^"']*["'][^>]*data-valmsg-for=["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>/gi
    ),
  ];
  const parts: string[] = [];
  for (const m of spans) {
    const field = (m[1] || "").trim();
    const msg = stripTags(m[2] || "");
    if (msg.length > 2 && msg.length < 400) {
      parts.push(field ? `${field}: ${msg}` : msg);
    }
  }
  if (parts.length) return [...new Set(parts)].join(" ");

  return null;
}

export function loginPostLooksSuccessful(res: AxiosResponse<string>): boolean {
  const html =
    typeof res.data === "string" ? res.data : String(res.data ?? "");
  const jar = getAxiosCookieHeader();

  if (res.status === 302) {
    return hasAuthenticationCookie(jar);
  }

  if (res.status === 200) {
    if (isLoginFormHtml(html)) return false;
    return hasAuthenticationCookie(jar);
  }

  return false;
}
