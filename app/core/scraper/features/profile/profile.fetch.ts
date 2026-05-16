import { client, WD_BASE_URL } from "../../client/client";

const HTML_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0.0.0 Safari/537.36";

function responseBody(data: unknown): string {
  return typeof data === "string" ? data : String(data ?? "");
}

/** GET HTML jak przeglądarka (bez Content-Type formularza z domyślnego klienta). */
export async function fetchHtmlPage(path: string): Promise<string> {
  const response = await client.get<string>(path, {
    responseType: "text",
    transformResponse: [(data) => data],
    maxRedirects: 5,
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
      "User-Agent": HTML_USER_AGENT,
      Referer: `${WD_BASE_URL}/`,
      "Content-Type": undefined,
    },
  });

  return responseBody(response.data);
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
