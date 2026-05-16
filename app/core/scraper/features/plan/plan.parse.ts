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

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTdValues(rowHtml: string): string[] {
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  const values: string[] = [];

  let match;

  while ((match = tdRegex.exec(rowHtml)) !== null) {
    values.push(stripHtml(match[1]));
  }

  return values;
}

export function parsePlan(
  html: string
): Lesson[] {

  const lessons: Lesson[] = [];

  const rowRegex =
    /<tr[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/tr>/gi;

  let currentDate = '';

  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {

    const rowId = rowMatch[1];
    const rowHtml = rowMatch[2];

    // GROUP ROW
    if (rowId.includes('DXGroupRow')) {

      const dateMatch = rowHtml.match(
        /Data Zajęć:\s*(\d{4}\.\d{2}\.\d{2})/
      );

      if (dateMatch?.[1]) {
        currentDate = dateMatch[1];
      }

      continue;
    }

    // DATA ROW
    if (!rowId.includes('DXDataRow')) {
      continue;
    }

    const cells = extractTdValues(rowHtml);

    if (cells.length < 8) {
      continue;
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

      notes: cells[11] ?? ''
    });
  }

  return lessons;
}
