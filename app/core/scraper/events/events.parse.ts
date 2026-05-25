import { parseHTML } from 'linkedom';

import {
  ANS_WEB_ORIGIN,
  EVENTS_MONTH_LABELS_UPPER,
} from './events.constants';
import type { PublicEvent } from './events.types';

function resolveAnsUrl(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) {
    return ANS_WEB_ORIGIN;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${ANS_WEB_ORIGIN}${trimmed}`;
  }
  return `${ANS_WEB_ORIGIN}/${trimmed}`;
}

function parseEventDate(raw: string): Pick<PublicEvent, 'day' | 'monthLabel' | 'dateLabel'> | null {
  const match = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) {
    return null;
  }

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }

  const monthLabel = EVENTS_MONTH_LABELS_UPPER[month - 1];
  const dateLabel = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;

  return { day, monthLabel, dateLabel };
}

function eventIdFromUrl(url: string): string {
  const slug = url.split('/').filter(Boolean).pop();
  return slug ?? url;
}

/** Porządek rosnący po dacie (najwcześniejsze wydarzenie po lewej). */
function comparePublicEventsByDate(a: PublicEvent, b: PublicEvent): number {
  const [dayA, monthA, yearA] = a.dateLabel.split('.').map((part) => Number.parseInt(part, 10));
  const [dayB, monthB, yearB] = b.dateLabel.split('.').map((part) => Number.parseInt(part, 10));

  if (yearA !== yearB) {
    return yearA - yearB;
  }
  if (monthA !== monthB) {
    return monthA - monthB;
  }
  return dayA - dayB;
}

export function parsePublicEvents(html: string): PublicEvent[] {
  const { document } = parseHTML(html);
  const section = document.querySelector('#events');
  if (!section) {
    return [];
  }

  const page =
    section.querySelector('.nspArtPage.active') ??
    section.querySelector('.nspArtPage');

  if (!page) {
    return [];
  }

  const events: PublicEvent[] = [];

  page.querySelectorAll('.nspArt').forEach((article) => {
    const dateRaw = article.querySelector('.nspInfo.nspInfo1')?.textContent?.trim() ?? '';
    const link = article.querySelector('h4.nspHeader a');

    if (!link) {
      return;
    }

    const parsedDate = parseEventDate(dateRaw);
    if (!parsedDate) {
      return;
    }

    const href = link.getAttribute('href') ?? '';
    const title =
      link.getAttribute('title')?.trim() ||
      link.textContent?.replace(/\u2026/g, '…').trim() ||
      '';

    if (!title) {
      return;
    }

    const url = resolveAnsUrl(href);

    events.push({
      id: eventIdFromUrl(url),
      title,
      url,
      ...parsedDate,
    });
  });

  return events.sort(comparePublicEventsByDate);
}
