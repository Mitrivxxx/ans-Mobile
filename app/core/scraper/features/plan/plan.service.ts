import {
  getCurrentWeekPlanParams,
  getSemesterPlanParams,
  type PlanFetchParams,
} from './plan.dateRange';
import { initPlanSession, fetchGrid } from './plan.grid';
import { parsePlan, Lesson } from './plan.parse';

export class PlanService {
  private async getLessonsForParams(params: PlanFetchParams): Promise<Lesson[]> {
    await initPlanSession(params);
    const gridHtml = await fetchGrid(undefined, params);
    return parsePlan(gridHtml);
  }

  /** Pełny plan semestru — zakładka Plan zajęć w sidebarze. */
  async getLessons(): Promise<Lesson[]> {
    try {
      return await this.getLessonsForParams(getSemesterPlanParams());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[PLAN] Error fetching semester lessons:', message);
      throw error;
    }
  }

  /** Tydzień kalendarzowy (pon.–niedz.) — dashboard; domyślnie bieżący. */
  async getWeekLessons(referenceDate = new Date()): Promise<Lesson[]> {
    try {
      return await this.getLessonsForParams(getCurrentWeekPlanParams(referenceDate));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[PLAN] Error fetching week lessons:', message);
      throw error;
    }
  }
}

export type { Lesson };
