import { describe, expect, it } from 'vitest';

import { getSemesterPlanParams } from '../../app/core/scraper/features/plan/plan.dateRange';
import { semesterLessonsOrKeepCached } from '../../app/features/plan/utils/semesterLessonsCache';
import type { Lesson } from '../../app/core/scraper/features/plan/plan.service';

const cachedLesson = { subject: 'Analiza' } as Lesson;

describe('getSemesterPlanParams', () => {
  it('keeps January inside the winter semester that started last October', () => {
    expect(getSemesterPlanParams(new Date(2027, 0, 15))).toEqual({
      dateFrom: '2026-10-1',
      dateTo: '2027-2-28',
      planType: '3',
    });
  });

  it('uses the coming winter semester from October', () => {
    expect(getSemesterPlanParams(new Date(2026, 9, 18))).toEqual({
      dateFrom: '2026-10-1',
      dateTo: '2027-2-28',
      planType: '3',
    });
  });
});

describe('semesterLessonsOrKeepCached', () => {
  it('keeps the saved semester when a refresh returns no lessons', () => {
    expect(() => semesterLessonsOrKeepCached([], [cachedLesson])).toThrow(
      /Pusta odpowiedź planu semestru/
    );
  });

  it('accepts an empty semester when nothing was saved', () => {
    expect(semesterLessonsOrKeepCached([], undefined)).toEqual([]);
  });

  it('replaces the saved semester when the refresh has lessons', () => {
    const fresh = [{ subject: 'Algebra' } as Lesson];
    expect(semesterLessonsOrKeepCached(fresh, [cachedLesson])).toBe(fresh);
  });
});
