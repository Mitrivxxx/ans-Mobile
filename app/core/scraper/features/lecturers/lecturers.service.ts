import {
  fetchLecturerSearchPage,
  postLecturerSearch,
} from "./lecturers.fetch";
import {
  extractDxFormTokens,
  extractHiddenFormFields,
  hasLecturerSearchValidationError,
  parseLecturerSearchResults,
} from "./lecturers.parse";
import type {
  LecturerSearchQuery,
  LecturerSearchResult,
} from "./lecturers.types";

export class LecturersService {
  async searchLecturers(
    query: LecturerSearchQuery
  ): Promise<LecturerSearchResult[]> {
    const firstName = query.firstName?.trim() ?? "";
    const lastName = query.lastName?.trim() ?? "";

    if (firstName === "%" || lastName === "%") {
      throw new Error('Znak "%" nie jest dozwolony w kryteriach wyszukiwania.');
    }

    const formHtml = await fetchLecturerSearchPage();
    const { dxScript, dxCss } = extractDxFormTokens(formHtml);
    const hiddenFields = extractHiddenFormFields(formHtml);

    const resultsHtml = await postLecturerSearch({
      firstName,
      lastName,
      dxScript,
      dxCss,
      hiddenFields,
    });

    const results = parseLecturerSearchResults(resultsHtml);
    if (results.length > 0) {
      return results;
    }

    if (hasLecturerSearchValidationError(resultsHtml)) {
      throw new Error(
        "Serwer odrzucił wyszukiwanie. Sprawdź wpisane kryteria."
      );
    }

    return results;
  }
}

export type { LecturerSearchQuery, LecturerSearchResult } from "./lecturers.types";
