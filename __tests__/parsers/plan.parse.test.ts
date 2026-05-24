import { describe, expect, it } from 'vitest';

import { parsePlan } from '../../app/core/scraper/features/plan/plan.parse';
import { authenticatedPage } from '../helpers/authenticatedPage';
import { readFixture } from '../helpers/readFixture';

describe('parsePlan', () => {
  it('łączy datę z wiersza grupy z lekcją DXDataRow', () => {
    const lessons = parsePlan(authenticatedPage(readFixture('plan-week.html')));

    expect(lessons).toHaveLength(1);
    expect(lessons[0]).toEqual({
      date: '2026.05.12',
      from: '08:00',
      to: '09:30',
      duration: '1,5',
      room: 'Sala 101',
      teacher: 'Jan Kowalski',
      subject: 'Matematyka',
      type: 'Wykład',
      groups: 'Gr. A',
      notes: 'Uwaga test',
    });
  });
});
