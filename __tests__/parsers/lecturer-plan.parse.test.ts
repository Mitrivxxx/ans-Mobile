import { describe, expect, it } from 'vitest';

import {
  lecturerGridHasDataRows,
  parseLecturerPlan,
} from '../../app/core/scraper/features/lecturers/lecturer-plan.parse';
import { readFixture } from '../helpers/readFixture';

describe('parseLecturerPlan', () => {
  it('parsuje plan wykładowcy z gridViewPlanyProwadzacych', () => {
    const lessons = parseLecturerPlan(readFixture('lecturer-plan.html'));

    expect(lessons).toHaveLength(1);
    expect(lessons[0]).toEqual({
      date: '2026.05.13',
      from: '10:00',
      to: '11:30',
      duration: '1,5',
      room: 'Sala 202',
      teacher: '',
      subject: 'Fizyka',
      type: 'Ćwiczenia',
      groups: 'Gr. B',
      notes: 'Notatka',
    });
  });
});

describe('lecturerGridHasDataRows', () => {
  it('wykrywa wiersze danych w HTML', () => {
    expect(lecturerGridHasDataRows(readFixture('lecturer-plan.html'))).toBe(
      true
    );
    expect(lecturerGridHasDataRows('<html></html>')).toBe(false);
  });
});
