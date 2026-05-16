import { initPlanSession, fetchGrid } from './plan.grid';
import { parsePlan, Lesson } from './plan.parse';

export class PlanService {
  async getLessons(): Promise<Lesson[]> {
    try {
      console.log('[PLAN] Initializing session');
      
      // Initialize session
      await initPlanSession();
      
      console.log('[PLAN] Fetching grid');
      
      // Fetch the grid
      const gridHtml = await fetchGrid();
      
      console.log('[PLAN] Parsing lessons');
      
      // Parse lessons
      const lessons = parsePlan(gridHtml);
      
      console.log('[PLAN] Found lessons:', lessons.length);
      
      return lessons;
    } catch (error: any) {
      console.error('[PLAN] Error fetching lessons:', error?.message);
      throw error;
    }
  }
}

export type { Lesson };
