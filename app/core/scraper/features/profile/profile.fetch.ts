import type { AxiosResponse } from "axios";

import { client, WD_BASE_URL } from "../../client/client";

const HTML_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0.0.0 Safari/537.36";

function responseBody(data: unknown): string {
  return typeof data === "string" ? data : String(data ?? "");
}

function responseFinalUrl(response: AxiosResponse): string {
  return String(
    (response.request as { responseURL?: string } | undefined)?.responseURL ??
      response.config.url ??
      ""
  );
}

export type HtmlPageFetchResult = {
  html: string;
  finalUrl: string;
};

export type FetchHtmlPageOptions = {
  /** Nie traktuj strony wyboru kontekstu jako utraty sesji w interceptorze. */
  skipSessionExpiryCheck?: boolean;
};

/** GET HTML jak przeglądarka (bez Content-Type formularza z domyślnego klienta). */
export async function fetchHtmlPage(
  path: string,
  options?: FetchHtmlPageOptions
): Promise<string> {
  const page = await fetchHtmlPageResult(path, options);
  return page.html;
}

export async function fetchHtmlPageResult(
  path: string,
  options?: FetchHtmlPageOptions
): Promise<HtmlPageFetchResult> {
  const response = await client.get<string>(path, {
    responseType: "text",
    transformResponse: [(data) => data],
    maxRedirects: 5,
    skipSessionExpiryCheck: options?.skipSessionExpiryCheck,
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
      "User-Agent": HTML_USER_AGENT,
      Referer: `${WD_BASE_URL}/`,
      "Content-Type": undefined,
    },
  });

  return {
    html: responseBody(response.data),
    finalUrl: responseFinalUrl(response),
  };
}

export async function fetchHomePage(): Promise<string> {
  return fetchHtmlPage("/");
}

export async function fetchAccountDetailsPage(): Promise<string> {
  return fetchHtmlPage("/konto/accountdetails");
}

export async function fetchStudiesPage(): Promise<string> {
  return fetchHtmlPage("/TokStudiow/StudentTokStudiow/DaneOToku");
}
