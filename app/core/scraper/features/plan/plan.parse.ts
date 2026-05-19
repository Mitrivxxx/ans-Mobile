import { parseHTML } from 'linkedom';

import { assertAuthenticatedHtml } from '../../auth/sessionValidation';

export interface Lesson {
  date: string;
  from: string;
  to: string;
  duration: string;
  room: string;
  teacher: string;
  subject: string;
  type: string;
  groups: string;
  notes: string;
}

function cellText(td: Element): string {
  return (td.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Bezpośrednie komórki wiersza — pomija zagnieżdżone tabele w nagłówkach. */
function getRowCells(row: Element): Element[] {
  return Array.from(row.children).filter(
    (node): node is Element => node.tagName === 'TD'
  );
}

/**
 * DevExpress GridView: pierwsza kolumna to wcięcie (expand), ostatnia to AIC.
 * Kolejność danych: Czas od, Czas do, Liczba godzin, Sala, Prowadzący, Zajęcia, …
 */
function getDataCellTexts(row: Element): string[] {
  const tds = getRowCells(row);
  let start = 0;
  let end = tds.length;

  const firstClass = tds[0]?.getAttribute('class') ?? '';
  if (
    firstClass.includes('dxgvIndentCell') ||
    firstClass.includes('dxgvCommandColumn')
  ) {
    start = 1;
  } else if (!cellText(tds[0] ?? ({} as Element)) && tds.length >= 13) {
    start = 1;
  }

  const lastClass = tds[end - 1]?.getAttribute('class') ?? '';
  if (lastClass.includes('dxgvAIC')) {
    end -= 1;
  }

  return tds.slice(start, end).map(cellText);
}

export function parsePlan(html: string): Lesson[] {
  assertAuthenticatedHtml(html, 'Sesja wygasła — nie można pobrać planu zajęć.');
  const { document } = parseHTML(html);
  const lessons: Lesson[] = [];
  let currentDate = '';

  const rows = document.querySelectorAll('tr[id]');

  rows.forEach((row) => {
    const rowId = row.getAttribute('id') ?? '';

    if (rowId.includes('DXGroupRow')) {
      const dateMatch = (row.textContent ?? '').match(
        /Data Zajęć:\s*(\d{4}\.\d{2}\.\d{2})/
      );
      if (dateMatch?.[1]) {
        currentDate = dateMatch[1];
      }
      return;
    }

    if (!rowId.includes('DXDataRow')) {
      return;
    }

    const cells = getDataCellTexts(row);

    if (cells.length < 8) {
      return;
    }

    lessons.push({
      date: currentDate,
      from: cells[0] ?? '',
      to: cells[1] ?? '',
      duration: cells[2] ?? '',
      room: cells[3] ?? '',
      teacher: cells[4] ?? '',
      subject: cells[5] ?? '',
      type: cells[6] ?? '',
      groups: cells[7] ?? '',
      notes: cells[11] ?? '',
    });
  });

  return lessons;
}
