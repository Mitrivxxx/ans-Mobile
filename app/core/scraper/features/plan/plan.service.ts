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
    // #region agent log
    const weekMondayKeyDbg = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}-${String(referenceDate.getDate()).padStart(2, '0')}`;
    fetch('http://127.0.0.1:7884/ingest/daefe8e1-1e84-486a-b8a4-fabf03b42721',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a4b3'},body:JSON.stringify({sessionId:'68a4b3',location:'plan.service.ts:getWeekLessons',message:'scrape week start',data:{weekMondayKey:weekMondayKeyDbg},timestamp:Date.now(),hypothesisId:'C,E'})}).catch(()=>{});
    // #endregion
    const scrapeStartedAt = Date.now();
    try {
      const lessons = await this.getLessonsForParams(getCurrentWeekPlanParams(referenceDate));
      // #region agent log
      fetch('http://127.0.0.1:7884/ingest/daefe8e1-1e84-486a-b8a4-fabf03b42721',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a4b3'},body:JSON.stringify({sessionId:'68a4b3',location:'plan.service.ts:getWeekLessons',message:'scrape week done',data:{weekMondayKey:weekMondayKeyDbg,lessonCount:lessons.length,ms:Date.now()-scrapeStartedAt},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return lessons;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // #region agent log
      fetch('http://127.0.0.1:7884/ingest/daefe8e1-1e84-486a-b8a4-fabf03b42721',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'68a4b3'},body:JSON.stringify({sessionId:'68a4b3',location:'plan.service.ts:getWeekLessons',message:'scrape week error',data:{weekMondayKey:weekMondayKeyDbg,ms:Date.now()-scrapeStartedAt,error:message},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.error('[PLAN] Error fetching week lessons:', message);
      throw error;
    }
  }
}

export type { Lesson };
