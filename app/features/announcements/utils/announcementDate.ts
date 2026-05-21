/**
 * Parsuje datę ogłoszenia w popularnych formatach Wirtualnego Dziekanatu.
 * Obsługiwane:
 *  - YYYY-MM-DD [HH:mm[:ss]]
 *  - YYYY.MM.DD [HH:mm[:ss]]
 *  - DD.MM.YYYY [HH:mm[:ss]]
 *  - DD-MM-YYYY [HH:mm[:ss]]
 */
export function parseAnnouncementDate(value: string): Date | null {
  const text = value.trim();
  if (!text) {
    return null;
  }

  const [datePart, timePart] = text.split(/\s+/, 2);
  const timeMatch = timePart?.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  const hours = timeMatch ? Number(timeMatch[1]) : 0;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  const seconds = timeMatch && timeMatch[3] ? Number(timeMatch[3]) : 0;

  const isoLike = datePart.match(/^(\d{4})[-.](\d{1,2})[-.](\d{1,2})$/);
  if (isoLike) {
    const [, year, month, day] = isoLike;
    return buildDate(
      Number(year),
      Number(month),
      Number(day),
      hours,
      minutes,
      seconds
    );
  }

  const polishLike = datePart.match(/^(\d{1,2})[.-](\d{1,2})[.-](\d{4})$/);
  if (polishLike) {
    const [, day, month, year] = polishLike;
    return buildDate(
      Number(year),
      Number(month),
      Number(day),
      hours,
      minutes,
      seconds
    );
  }

  return null;
}

function buildDate(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number
): Date | null {
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day, hours, minutes, seconds, 0);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}
