/** Kolory typów zajęć — używane w harmonogramie i innych widokach. */
export const lessonTypeColors = {
  wyk: '#F2703F',
  sem: '#E5B800',
  proj: '#548DF3',
  lab: '#E879A8',
  cwiczenia: '#4CAF50',
} as const;

export type LessonTypeColorKey = keyof typeof lessonTypeColors;

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
  { key: 'wyk', abbreviation: 'W', patterns: ['wyk', 'wykład', 'wyklad'] },
  { key: 'sem', abbreviation: 'S', patterns: ['sem', 'seminarium'] },
  { key: 'proj', abbreviation: 'P', patterns: ['proj', 'projekt'] },
  { key: 'lab', abbreviation: 'L', patterns: ['lab', 'laboratorium'] },
  {
    key: 'cwiczenia',
    abbreviation: 'Ć',
    patterns: ['ćw', 'cw', 'cwiczenia', 'ćwiczenia', 'ca'],
  },
];

function normalizeType(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchLessonTypeStyle(value: string): LessonTypeStyle | null {
  const normalized = normalizeType(value);
  if (!normalized) {
    return null;
  }

  for (const rule of LESSON_TYPE_RULES) {
    if (rule.patterns.some((pattern) => normalized.startsWith(pattern))) {
      return {
        key: rule.key,
        abbreviation: rule.abbreviation,
        color: lessonTypeColors[rule.key],
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
  groups = ''
): LessonTypeStyle | null {
  return matchLessonTypeStyle(groups) ?? matchLessonTypeStyle(type);
}
