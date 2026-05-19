/** Uwagi z planu (np. „Brak”, „E-learning”). */
export function isELearningNotes(notes: string): boolean {
  return /e-learning/i.test(notes.trim());
}

export function formatLessonSubjectLabel(subject: string, notes: string): string {
  if (!subject) return subject;
  if (!isELearningNotes(notes)) return subject;
  return `${subject} (E-learning)`;
}
