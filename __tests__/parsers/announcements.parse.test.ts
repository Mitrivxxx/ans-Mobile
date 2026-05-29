import { describe, expect, it } from 'vitest';

import {
  listItemHasAttachment,
  listItemListIcon,
  parseAnnouncementDetails,
  parseAnnouncements,
} from '../../app/core/scraper/features/announcements/announcements.parse';
import { parseHTML } from 'linkedom';
import { SessionExpiredError } from '../../app/core/scraper/auth/sessionValidation';
import { authenticatedPage } from '../helpers/authenticatedPage';
import { readFixture } from '../helpers/readFixture';

describe('parseAnnouncements', () => {
  it('parsuje listę ogłoszeń', () => {
    const html = authenticatedPage(readFixture('announcements-list.html'));
    const items = parseAnnouncements(html);

    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({
      title: 'Ważne ogłoszenie',
      url: '/gloszenia/Ogloszenie/42',
      id: '42',
      authorName: 'Dziekanat',
      date: '2026-05-01',
      hasAttachment: false,
      listIcon: 'circle-info',
    });
    expect(items[1]).toMatchObject({
      title: 'Z załącznikiem',
      id: '99',
      hasAttachment: true,
      listIcon: 'triangle-exclamation',
    });
    expect(items[2]).toMatchObject({
      title: 'Pilne',
      id: '100',
      listIcon: 'exclamation',
      hasAttachment: false,
    });
  });

  it('wykrywa załącznik po zagnieżdżonym div w slocie flex', () => {
    const { document } = parseHTML(readFixture('announcements-list.html'));
    const items = document.querySelectorAll('.list-group-item, .list-group > li');

    expect(listItemHasAttachment(items[0]!)).toBe(false);
    expect(listItemHasAttachment(items[1]!)).toBe(true);
    expect(listItemListIcon(items[0]!)).toBe('circle-info');
    expect(listItemListIcon(items[1]!)).toBe('triangle-exclamation');
    expect(listItemListIcon(items[2]!)).toBe('exclamation');
  });

  it('rzuca SessionExpiredError dla strony logowania', () => {
    const loginHtml = authenticatedPage(`
      <input name="Username" />
      <input name="Password" />
      <input name="__RequestVerificationToken" value="x" />
    `);

    expect(() => parseAnnouncements(loginHtml)).toThrow(SessionExpiredError);
  });
});

describe('parseAnnouncementDetails', () => {
  it('parsuje treść, nadawcę i datę', () => {
    const html = authenticatedPage(readFixture('announcement-detail.html'));
    const details = parseAnnouncementDetails(html);

    expect(details).toEqual({
      content: '<p>Treść <b>HTML</b></p>',
      authorName: 'Jan Kowalski',
      date: '2026-05-10 12:00',
      attachmentUrl: null,
      attachmentName: null,
    });
  });

  it('używa fallbacku data-bind gdy brak .apr-notice', () => {
    const html = authenticatedPage(
      '<span data-bind="html: TrescHtml"><em>Fallback</em></span>'
    );

    expect(parseAnnouncementDetails(html)).toMatchObject({
      content: '<em>Fallback</em>',
      authorName: 'Wirtualny Dziekanat',
      date: '',
    });
  });
});
