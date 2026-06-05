import { fetchHtmlPage } from "../profile/profile.fetch";

const GROUPS_PATH = "/TokStudiow/StudentTokStudiow/Grupy";

export async function fetchGroupsPage(): Promise<string> {
  return fetchHtmlPage(GROUPS_PATH);
}

export async function fetchGroupsPageForSemester(
  semesterId: string,
  semesterLabel: string
): Promise<string> {
  const params = new URLSearchParams({
    s_VI: semesterId,
    s: semesterLabel,
    "s$DDD$L": semesterId,
    SubBtn: "",
    DXMVCEditorsValues: JSON.stringify({
      s_DDD_L: [semesterId],
      s: semesterId,
    }),
  });

  return fetchHtmlPage(`${GROUPS_PATH}?${params.toString()}`);
}
