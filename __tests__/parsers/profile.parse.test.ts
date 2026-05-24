import { describe, expect, it } from 'vitest';

import {
  parseAccountDetailsFromHtml,
  parseStudiesDataFromHtml,
} from '../../app/core/scraper/features/profile/profile.parse';
import { readFixture } from '../helpers/readFixture';

describe('parseAccountDetailsFromHtml', () => {
  it('parsuje dane konta i sekcję identify', () => {
    const account = parseAccountDetailsFromHtml(
      readFixture('profile-account.html')
    );

    expect(account).toEqual({
      firstName: 'Jan',
      lastName: 'Kowalski',
      albumNumber: '123456',
      major: 'Informatyka stosowana',
      login: 'jkowalski',
      privateEmail: 'jan@example.com',
      universityEmail: 'jan@ans-ns.edu.pl',
      lastLoginDate: '2026-05-01',
      lastPasswordChangeDate: '2025-01-01',
    });
  });
});

describe('parseStudiesDataFromHtml', () => {
  it('parsuje tabelę danych o studiach', () => {
    const studies = parseStudiesDataFromHtml(
      readFixture('profile-studies.html')
    );

    expect(studies).toMatchObject({
      studyTrack: '1 stopień',
      albumNumber: '123456',
      legitimationNumber: 'L-99',
      studentStatus: 'aktywny',
      year: '3',
      semester: '5',
      studyMode: 'dzienne',
      faculty: 'IT',
      major: 'Informatyka',
    });
  });
});
