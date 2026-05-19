import { useCallback, useEffect, useRef, useState } from 'react';

import type { SemesterGrades } from '../../../core/scraper/features/grades/grades.service';
import { useGradesQuery } from './useGradesQuery';

function indexOfLatestSemester(semesters: SemesterGrades[]): number {
  if (semesters.length === 0) {
    return 0;
  }

  let latestIndex = 0;
  for (let index = 1; index < semesters.length; index += 1) {
    if (semesters[index].semester > semesters[latestIndex].semester) {
      latestIndex = index;
    }
  }

  return latestIndex;
}

export function useGrades() {
  const {
    semesters,
    isInitialLoading,
    isFatalError,
    refetch,
  } = useGradesQuery();
  const [semesterIndex, setSemesterIndex] = useState(0);
  const appliedInitialSemesterRef = useRef(false);

  useEffect(() => {
    if (semesters.length === 0) {
      appliedInitialSemesterRef.current = false;
      setSemesterIndex(0);
      return;
    }

    if (!appliedInitialSemesterRef.current) {
      setSemesterIndex(indexOfLatestSemester(semesters));
      appliedInitialSemesterRef.current = true;
      return;
    }

    setSemesterIndex((index) =>
      Math.min(index, semesters.length - 1)
    );
  }, [semesters]);

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

  const hasAnySubjects = semesters.some(
    (semester) => semester.subjects.length > 0
  );

  return {
    semesters,
    currentSemester,
    semesterIndex,
    loading: isInitialLoading && !hasAnySubjects,
    error: isFatalError ? 'Nie udało się pobrać ocen' : '',
    canGoPrevious,
    canGoNext,
    goToPreviousSemester,
    goToNextSemester,
    refetch: async () => {
      await refetch();
    },
  };
}
