import { describe, expect, it } from 'vitest';

import {
  extractDxFormTokens,
  extractHiddenFormFields,
  hasLecturerSearchValidationError,
  parseLecturerSearchResults,
} from '../../app/core/scraper/features/lecturers/lecturers.parse';
import { readFixture } from '../helpers/readFixture';

describe('parseLecturerSearchResults', () => {
  it('parsuje wiersze tabeli wykładowców', () => {
    const results = parseLecturerSearchResults(readFixture('lecturers-search.html'));

    expect(results).toHaveLength(2);

    expect(results[0]).toEqual({
      name: 'Jan Nowak',
      additionalInfo: 'dr hab.\ntel. 123',
      email: '',
      organizationalUnits: 'Wydział IT',
      schedulePath: '/Plany/PlanyProwadzacych/99',
      scheduleId: '99',
    });

    expect(results[1]).toMatchObject({
      name: 'Anna Kowalska',
      email: 'anna@ans-ns.edu.pl',
      schedulePath: '',
      scheduleId: '',
    });
  });
});

describe('hasLecturerSearchValidationError', () => {
  it('wykrywa widoczny błąd walidacji', () => {
    const html = `
      <div class="validation-summary-errors">
        <ul><li style="display:none"></li><li>Wpisz co najmniej 3 znaki</li></ul>
      </div>
    `;
    expect(hasLecturerSearchValidationError(html)).toBe(true);
  });

  it('ignoruje ukryte elementy i pusty summary', () => {
    expect(
      hasLecturerSearchValidationError(
        '<div class="validation-summary-errors"><ul><li style="display:none">x</li></ul></div>'
      )
    ).toBe(false);
    expect(hasLecturerSearchValidationError('<html></html>')).toBe(false);
  });
});

describe('extractHiddenFormFields', () => {
  it('zbiera ukryte pola formularza aspnet', () => {
    expect(extractHiddenFormFields(readFixture('lecturers-search.html'))).toEqual({
      __VIEWSTATE: 'abc',
    });
  });
});

describe('extractDxFormTokens', () => {
  it('czyta DXScript i DXCss z inputów', () => {
    expect(extractDxFormTokens(readFixture('lecturers-search.html'))).toEqual({
      dxScript: '1,2',
      dxCss: '/dx.css',
    });
  });

  it('wyciąga DXScript z DXR.axd w HTML', () => {
    const html = '<script src="/DXR.axd?r=10-20,30"></script>';
    expect(extractDxFormTokens(html).dxScript).toBe('10,20,30');
  });
});
