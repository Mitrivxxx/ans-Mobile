/** Kolory typów zajęć — używane w harmonogramie i innych widokach. */
export const lessonTypeColors = {
  wyk: '#F2703F',
  sem: '#E5B800',
  proj: '#548DF3',
  lab: '#E879A8',
  ca: '#4CAF50',
  lek: '#9E7B4E',
  zwf: '#8E6BC1',
} as const;

export type LessonTypeColorKey = keyof typeof lessonTypeColors;

/** Ciemny motyw — rozjaśnione odcienie tam, gdzie bazowy kolor ma za niski kontrast na karcie. */
export const darkLessonTypeColors: Record<LessonTypeColorKey, string> = {
  ...lessonTypeColors,
  lek: '#C49B6C',
  zwf: '#AE8FDD',
};

export type LessonTypeStyle = {
  key: LessonTypeColorKey;
  abbreviation: string;
  color: string;
};

const LESSON_TYPE_RULES: {
  key: LessonTypeColorKey;
  abbreviation: string;
  patterns: string[];
}[] = [
  { key: 'wyk', abbreviation: 'W', patterns: ['wyk', 'wykład'] },
  { key: 'sem', abbreviation: 'S', patterns: ['sem', 'seminarium'] },
  { key: 'proj', abbreviation: 'P', patterns: ['proj', 'projekt'] },
  { key: 'lek', abbreviation: 'Le', patterns: ['lek', 'lektorat'] },
  { key: 'lab', abbreviation: 'L', patterns: ['lab', 'laboratorium'] },
  { key: 'ca', abbreviation: 'Ca', patterns: ['ca', 'ćwiczenia'] },
  { key: 'zwf', abbreviation: 'Z', patterns: ['zwf', 'wf'] },
];

function normalizeType(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchLessonTypeStyle(
  value: string,
  palette: Record<LessonTypeColorKey, string>
): LessonTypeStyle | null {
  const normalized = normalizeType(value);
  if (!normalized) {
    return null;
  }

  for (const rule of LESSON_TYPE_RULES) {
    if (rule.patterns.some((pattern) => normalized.startsWith(pattern))) {
      return {
        key: rule.key,
        abbreviation: rule.abbreviation,
        color: palette[rule.key],
      };
    }
  }

  return null;
}

/**
 * Mapuje typ zajęć ze scrapera na kolor i skrót.
 * Typ bywa w polu `type`, często też w `groups` (np. „Proj”).
 */
export function resolveLessonTypeStyle(
  type: string,
  groups = '',
  isDarkMode = false
): LessonTypeStyle | null {
  const palette = isDarkMode ? darkLessonTypeColors : lessonTypeColors;
  return (
    matchLessonTypeStyle(groups, palette) ?? matchLessonTypeStyle(type, palette)
  );
}
