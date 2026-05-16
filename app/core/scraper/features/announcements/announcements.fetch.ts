import { client } from "../../client/client";

function responseBody(data: unknown): string {
  return typeof data === "string" ? data : String(data ?? "");
}

export async function fetchAnnouncementsPage(): Promise<string> {
  const response = await client.get("/Ogloszenia/Ogloszenia");
  return responseBody(response.data);
}

export async function fetchAnnouncementDetails(
  urlOrId: string
): Promise<string> {
  const url = urlOrId.includes("/")
    ? urlOrId
    : `/Ogloszenia/Ogloszenie/${urlOrId}`;
  const response = await client.get(url);
  return responseBody(response.data);
}
