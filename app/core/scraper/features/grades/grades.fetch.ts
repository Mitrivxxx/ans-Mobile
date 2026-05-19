import { client } from "../../client/client";

function responseBody(data: unknown): string {
  return typeof data === "string" ? data : String(data ?? "");
}

export async function fetchGradesPage(): Promise<string> {
  const response = await client.get(
    "/TokStudiow/StudentPrzedmiotyIOceny/Oceny"
  );
  return responseBody(response.data);
}

export async function fetchSemesterSubjects(
  semesterRequestPath: string
): Promise<string> {
  const response = await client.get(semesterRequestPath);
  return responseBody(response.data);
}

export async function fetchPartialGrades(pplsId: number): Promise<string> {
  const response = await client.get(
    "/TokStudiow/StudentPrzedmiotyIOceny/OcenySrodsemestralne",
    {
      params: {
        area: "TokStudiow",
        ppls: pplsId,
        _: Date.now(),
      },
    }
  );
  return responseBody(response.data);
}
