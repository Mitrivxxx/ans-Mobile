import { describe, expect, it } from 'vitest';

import { parsePublicEvents } from '../../app/core/scraper/events/events.parse';
import { readFixture } from '../helpers/readFixture';

describe('parsePublicEvents', () => {
  it('parsuje wydarzenia z sekcji #events', () => {
    const events = parsePublicEvents(readFixture('events.html'));

    expect(events).toHaveLength(2);

    expect(events[0]).toMatchObject({
      id: 'wydarzenie-dni-otwarte',
      title: 'Dni otwarte',
      url: 'https://www.ans-ns.edu.pl/aktualnosci/wydarzenie-dni-otwarte',
      day: 15,
      monthLabel: 'MARCA',
      dateLabel: '15.03.2026',
    });

    expect(events[1]).toMatchObject({
      id: 'zew',
      title: 'Zewnętrzne',
      url: 'https://example.org/zew',
      day: 1,
      monthLabel: 'GRUDNIA',
      dateLabel: '01.12.2025',
    });
  });

  it('zwraca pustą tablicę bez sekcji #events', () => {
    expect(parsePublicEvents('<html><body></body></html>')).toEqual([]);
  });
});
