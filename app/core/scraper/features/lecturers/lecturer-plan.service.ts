import type { Lesson } from "../plan/plan.parse";
import {
  fetchLecturerPlanPage,
  normalizeLecturerGridResponse,
  postLecturerPlanGrid,
} from "./lecturer-plan.grid";
import {
  lecturerGridHasDataRows,
  parseLecturerPlan,
} from "./lecturer-plan.parse";

export class LecturerPlanService {
  async getLessons(scheduleId: string): Promise<Lesson[]> {
    const pageHtml = await fetchLecturerPlanPage(scheduleId);

    const gridRaw = await postLecturerPlanGrid(scheduleId, pageHtml);
    const html = normalizeLecturerGridResponse(gridRaw);

    let lessons = parseLecturerPlan(html);
    if (lessons.length === 0 && lecturerGridHasDataRows(gridRaw)) {
      lessons = parseLecturerPlan(gridRaw);
    }

    return lessons;
  }
}

export type { Lesson };
