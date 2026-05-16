import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  GradesService,
  type SemesterGrades,
} from '../../../core/scraper/features/grades/grades.service';

export function useGrades() {
  const gradesService = useMemo(() => new GradesService(), []);
  const [semesters, setSemesters] = useState<SemesterGrades[]>([]);
  const [semesterIndex, setSemesterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await gradesService.getGrades();
      setSemesters(data);
      setSemesterIndex(data.length > 0 ? data.length - 1 : 0);
    } catch (err) {
      console.error('[GRADES]', err);
      setError('Nie udało się pobrać ocen');
    } finally {
      setLoading(false);
    }
  }, [gradesService]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const currentSemester = semesters[semesterIndex] ?? null;
  const canGoPrevious = semesterIndex > 0;
  const canGoNext = semesterIndex < semesters.length - 1;

  const goToPreviousSemester = useCallback(() => {
    setSemesterIndex((index) => Math.max(0, index - 1));
  }, []);

  const goToNextSemester = useCallback(() => {
    setSemesterIndex((index) =>
      Math.min(semesters.length - 1, index + 1)
    );
  }, [semesters.length]);

  return {
    semesters,
    currentSemester,
    semesterIndex,
    loading,
    error,
    canGoPrevious,
    canGoNext,
    goToPreviousSemester,
    goToNextSemester,
    refetch: fetchGrades,
  };
}
