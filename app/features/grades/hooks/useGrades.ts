import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { runWithManualRefreshCooldown } from '../../../core/queryClient/manualRefreshCooldown';
import { mergeSyncStatuses } from '../../../core/queryClient/mergeSyncStatuses';
import type { GradesSemesterMeta } from '../../../core/scraper/features/grades/grades.service';
import type { SemesterGrades } from '../../../core/scraper/features/grades/grades.service';
import type { SyncStatus } from '../../../core/queryClient/syncTypes';
import { isDemoPresentationMode } from '../../../config/env';
import { DEMO_SEMESTER_GRADES } from '../../../demo/demoMockData';
import { useGradesIndexQuery } from './useGradesIndexQuery';
import { useSemesterGradesQuery } from './useSemesterGradesQuery';

function indexOfSemester(
  semesters: GradesSemesterMeta[],
  semesterNumber: number
): number {
  const index = semesters.findIndex(
    (semester) => semester.semester === semesterNumber
  );
  return index >= 0 ? index : 0;
}

export function useGrades() {
  const isDemo = isDemoPresentationMode();

  const {
    index,
    syncStatus: indexSyncStatus,
    isInitialLoading: indexLoading,
    isFatalError: indexError,
    refetch: refetchIndex,
    forceRefresh: forceRefreshIndex,
  } = useGradesIndexQuery();

  const semestersMeta = index?.semesters ?? [];
  const [semesterIndex, setSemesterIndex] = useState(0);
  const appliedInitialSemesterRef = useRef(false);

  useEffect(() => {
    if (!index || semestersMeta.length === 0) {
      appliedInitialSemesterRef.current = false;
      setSemesterIndex(0);
      return;
    }

    if (!appliedInitialSemesterRef.current) {
      setSemesterIndex(
        indexOfSemester(semestersMeta, index.initialSemesterNumber)
      );
      appliedInitialSemesterRef.current = true;
      return;
    }

    setSemesterIndex((current) =>
      Math.min(current, semestersMeta.length - 1)
    );
  }, [index, semestersMeta]);

  const currentMeta = semestersMeta[semesterIndex] ?? null;

  const {
    semesterGrades,
    syncStatus: semesterSyncStatus,
    isInitialLoading: semesterLoading,
    hasCachedSemester,
    isFatalError: semesterError,
    refetch: refetchSemester,
    forceRefresh: forceRefreshSemester,
  } = useSemesterGradesQuery(currentMeta, semestersMeta.length > 0);

  const syncStatus: SyncStatus = useMemo(
    () =>
      currentMeta != null
        ? mergeSyncStatuses(indexSyncStatus, semesterSyncStatus)
        : indexSyncStatus,
    [currentMeta, indexSyncStatus, semesterSyncStatus]
  );

  const semesters: SemesterGrades[] = useMemo(() => {
    if (!index) {
      return [];
    }
    return index.semesters.map((meta) => {
      if (
        currentMeta &&
        meta.semester === currentMeta.semester &&
        semesterGrades
      ) {
        return semesterGrades;
      }
      return {
        semester: meta.semester,
        semesterLabel: meta.semesterLabel,
        academicSemester: meta.academicSemester,
        semesterType: meta.semesterType,
        semesterStatus: meta.semesterStatus,
        semesterAverage: '0',
        subjects: [],
      };
    });
  }, [index, currentMeta, semesterGrades]);

  const currentSemester = semesters[semesterIndex] ?? null;
  const canGoPrevious = semesterIndex > 0;
  const canGoNext = semesterIndex < semestersMeta.length - 1;

  const goToPreviousSemester = useCallback(() => {
    setSemesterIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToNextSemester = useCallback(() => {
    setSemesterIndex((i) => Math.min(semestersMeta.length - 1, i + 1));
  }, [semestersMeta.length]);

  const loading = indexLoading && !index;

  const isFatalError = indexError || semesterError;

  const refetch = useCallback(async () => {
    await refetchIndex();
    if (currentMeta) {
      await refetchSemester();
    }
  }, [refetchIndex, refetchSemester, currentMeta]);

  const forceRefresh = useCallback(
    () =>
      runWithManualRefreshCooldown(async () => {
        await forceRefreshIndex();
        if (currentMeta) {
          await forceRefreshSemester();
        }
      }),
    [forceRefreshIndex, forceRefreshSemester, currentMeta]
  );

  if (isDemo) {
    return {
      semesters: [DEMO_SEMESTER_GRADES],
      currentSemester: DEMO_SEMESTER_GRADES,
      semesterIndex: 0,
      loading: false,
      error: '',
      canGoPrevious: false,
      canGoNext: false,
      goToPreviousSemester: () => {},
      goToNextSemester: () => {},
      isSemesterLoading: false,
      syncStatus: 'upToDate' as SyncStatus,
      refetch: async () => {},
      forceRefresh: async () => {},
    };
  }

  return {
    semesters,
    currentSemester,
    semesterIndex,
    loading,
    error: isFatalError ? 'Nie udało się pobrać ocen' : '',
    canGoPrevious,
    canGoNext,
    goToPreviousSemester,
    goToNextSemester,
    isSemesterLoading: semesterLoading && !hasCachedSemester,
    syncStatus,
    refetch,
    forceRefresh,
  };
}
