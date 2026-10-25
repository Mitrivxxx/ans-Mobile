import { describe, expect, it } from 'vitest';

import { buildLecturerParametry } from '../../app/core/scraper/features/lecturers/lecturer-plan.grid';

describe('buildLecturerParametry', () => {
  it('uses winter semester from October (same window as student plan)', () => {
    expect(buildLecturerParametry('769', new Date(2026, 9, 18))).toBe(
      '2026-10-1;2027-2-28;3;769'
    );
  });

  it('keeps January inside the winter semester that started last October', () => {
    expect(buildLecturerParametry('769', new Date(2027, 0, 15))).toBe(
      '2026-10-1;2027-2-28;3;769'
    );
  });

  it('uses summer semester in May', () => {
    expect(buildLecturerParametry('769', new Date(2026, 4, 13))).toBe(
      '2026-2-19;2026-9-30;3;769'
    );
  });
});
