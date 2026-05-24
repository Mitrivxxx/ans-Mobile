import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';

import {
  discoverGradesIndex,
  extractSemesterInfo,
  extractSemesterRequestPath,
  extractSubjectsFromTable,
  parsePartialGradesHtml,
} from '../../app/core/scraper/features/grades/grades.parse';
import { authenticatedPage } from '../helpers/authenticatedPage';
import { readFixture } from '../helpers/readFixture';

describe('extractSemesterInfo', () => {
  it('wyciąga metadane semestru z karty', () => {
    const doc = parseHTML(readFixture('grades-index.html')).document;
    const card = doc.querySelectorAll('div.card')[0]!;
    const info = extractSemesterInfo(card);

    expect(info).toEqual({
      number: '3',
      label: 'Semestr 3 (2025/2026 letni)',
      academicSemester: '2025/2026 letni',
      type: 'letni',
      status: 'aktywny',
    });
  });

  it('zwraca null gdy brak numeru semestru', () => {
    const doc = parseHTML('<div class="card"><span>Inne</span></div>').document;
    expect(extractSemesterInfo(doc.querySelector('div.card')!)).toBeNull();
  });
});

describe('extractSemesterRequestPath', () => {
  it('parsuje ścieżkę z onclick rozwinZwin', () => {
    const doc = parseHTML(readFixture('grades-index.html')).document;
    const card = doc.querySelectorAll('div.card')[0]!;
    expect(extractSemesterRequestPath(card)).toBe('/Oceny/Semestr?sem=3');
  });
});

describe('discoverGradesIndex', () => {
  it('zbiera semestry i sortuje rosnąco', () => {
    const index = discoverGradesIndex(readFixture('grades-index.html'));

    expect(index.semesters).toHaveLength(2);
    expect(index.semesters.map((s) => s.semester)).toEqual([2, 3]);
    expect(index.initialSemesterNumber).toBe(3);
    expect(index.semesters[1]).toMatchObject({
      semester: 3,
      requestPath: '/Oceny/Semestr?sem=3',
      semesterType: 'letni',
      semesterStatus: 'aktywny',
    });
  });
});

describe('parsePartialGradesHtml', () => {
  it('parsuje formy z ocenami cząstkowymi', () => {
    const activities = parsePartialGradesHtml(
      authenticatedPage(readFixture('grades-partial.html'))
    );

    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      form: 'Ćwiczenia',
      finalGrade: '4,5',
    });
    expect(activities[0].partialGrades).toEqual([
      { label: 'Kolokwium', value: '4,0' },
      { label: 'Egzamin', value: '5,0' },
    ]);
  });
});

describe('extractSubjectsFromTable', () => {
  it('wyciąga przedmioty z tabeli semestru', () => {
    const subjects = extractSubjectsFromTable(
      readFixture('grades-subjects-table.html')
    );

    expect(subjects).toEqual([
      {
        subject: 'Programowanie',
        teacher: 'Anna Nowak',
        finalGrade: '5,0',
        pplsId: 12345,
      },
    ]);
  });
});
