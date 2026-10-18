import type { Lesson } from '../../../core/scraper/features/plan/plan.service';

/** Pusta siatka nie zastępuje zapisanego semestru — stary plan zostaje do udanego scrape. */
export function semesterLessonsOrKeepCached(
  fresh: Lesson[],
  cached: Lesson[] | undefined
): Lesson[] {
  if (fresh.length === 0 && cached && cached.length > 0) {
    throw new Error('Pusta odpowiedź planu semestru');
  }
  return fresh;
}
