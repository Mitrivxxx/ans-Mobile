import qs from "qs";

import { client, WD_BASE_URL } from "../../client/client";
import { fetchHtmlPage } from "../profile/profile.fetch";

export const LECTURER_SEARCH_PATH =
  "/TokStudiow/StudentZnajdzOsobe/ZnajdzProwadzacego";

export const LECTURER_SEARCH_URL = `${WD_BASE_URL}${LECTURER_SEARCH_PATH}`;

function responseBody(data: unknown): string {
  return typeof data === "string" ? data : String(data ?? "");
}

export async function fetchLecturerSearchPage(): Promise<string> {
  return fetchHtmlPage(LECTURER_SEARCH_PATH);
}

export async function postLecturerSearch(params: {
  firstName: string;
  lastName: string;
  dxScript: string;
  dxCss: string;
  hiddenFields?: Record<string, string>;
}): Promise<string> {
  const body: Record<string, string> = {
    ...params.hiddenFields,
    Imie: params.firstName,
    Nazwisko: params.lastName,
    FiltrPokazujZdjecieOsoby: "false",
  };

  if (params.dxScript) {
    body.DXScript = params.dxScript;
  }
  if (params.dxCss) {
    body.DXCss = params.dxCss;
  }

  const response = await client.post<string>(
    LECTURER_SEARCH_PATH,
    qs.stringify(body),
    {
      responseType: "text",
      transformResponse: [(data) => data],
      maxRedirects: 5,
      headers: {
        Referer: LECTURER_SEARCH_URL,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    }
  );

  return responseBody(response.data);
}
