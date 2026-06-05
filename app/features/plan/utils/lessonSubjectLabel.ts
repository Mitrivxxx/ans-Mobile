/** Uwagi z planu (np. „Brak”, „E-learning”, „Zajęcia odwołane”). */
export function isELearningNotes(notes: string): boolean {
  return /e-learning/i.test(notes.trim());
}

export function isCancelledNotes(notes: string): boolean {
  return /zajęcia\s+odwołane/i.test(notes.trim());
}

export function formatLessonSubjectLabel(subject: string, notes: string): string {
  if (!subject) return subject;
  if (isCancelledNotes(notes)) return `${subject} (Zajęcia odwołane)`;
  if (isELearningNotes(notes)) return `${subject} (E-learning)`;
  return subject;
}
