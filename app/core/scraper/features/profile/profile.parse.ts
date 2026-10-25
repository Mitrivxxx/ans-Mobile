import { parseHTML } from "linkedom";

import { getLastUsername } from "../../../auth/sessionUser.storage";
import { assertAuthenticatedHtml } from "../../auth/sessionValidation";
import { fetchAvatarPhoto } from "./profile.avatar";
import {
  getCachedProfilePhoto,
  setCachedProfilePhoto,
} from "./profilePhotoSessionCache";
import {
  fetchAccountDetailsPage,
  fetchStudiesPage,
} from "./profile.fetch";
import type {
  AccountData,
  CompleteProfileData,
  ProfileSummary,
  StudiesData,
} from "./profile.types";

export type {
  AccountData,
  CompleteProfileData,
  ProfileSummary,
  StudiesData,
} from "./profile.types";

function parseDocument(html: string): Document {
  const { document } = parseHTML(html);
  return document;
}

function tableRowsFromTbody(tbody: Element): Record<string, string> {
  const rows: Record<string, string> = {};
  tbody.querySelectorAll("tr").forEach((row) => {
    const th = row.querySelector("th")?.textContent?.trim() ?? "";
    const td = row.querySelector("td")?.textContent?.trim() ?? "";
    if (th && td) rows[th] = td;
  });
  return rows;
}

function findCardTableByHeading(
  doc: Document,
  headingPart: string
): Element | null {
  const headings = doc.querySelectorAll("h2");
  for (const h2 of Array.from(headings)) {
    if (!(h2.textContent ?? "").includes(headingPart)) continue;
    const tbody = h2.closest(".card")?.querySelector("table tbody");
    if (tbody) return tbody;
  }
  return doc.querySelector(".card table tbody");
}

function rowValue(rows: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (rows[key]) return rows[key];
  }
  return "";
}

export function parseAccountDetailsFromHtml(html: string): AccountData {
  const doc = parseDocument(html);
  const identifySection = doc.querySelector(".identify");

  const fullName =
    identifySection
      ?.querySelector("p:nth-child(2) .sensitive")
      ?.textContent?.trim() ?? "";
  const [firstName, ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.join(" ");

  const albumNumber =
    identifySection?.querySelector("p:nth-child(3)")?.textContent?.trim() ?? "";
  const major =
    identifySection?.querySelector("p:nth-child(4)")?.textContent?.trim() ??
    "";

  const accountTbody = findCardTableByHeading(doc, "Konto");
  const rows = accountTbody ? tableRowsFromTbody(accountTbody) : {};

  return {
    firstName: firstName || "",
    lastName: lastName || "",
    albumNumber: albumNumber || "",
    major: major || "",
    login: rows["Login"] || "",
    privateEmail: rows["Email prywatny"] || "",
    universityEmail: rows["Email uczelniany"] || "",
    lastLoginDate: rows["Data ostatniego logowania"] || "",
    lastPasswordChangeDate: rows["Data ostatniej zmiany hasła"] || "",
  };
}

function buildProfileSummary(
  account: AccountData,
  studies: StudiesData,
  photo: string
): ProfileSummary {
  return {
    firstName: account.firstName,
    lastName: account.lastName,
    albumNumber: account.albumNumber || studies.albumNumber,
    major: account.major || studies.major,
    photo,
  };
}

export async function parseProfileSummary(): Promise<ProfileSummary> {
  const [accountHtml, studiesHtml] = await Promise.all([
    fetchAccountDetailsPage(),
    fetchStudiesPage(),
  ]);

  assertAuthenticatedHtml(accountHtml);
  assertAuthenticatedHtml(studiesHtml);

  const account = parseAccountDetailsFromHtml(accountHtml);
  const studies = parseStudiesDataFromHtml(studiesHtml);

  const photo = await resolveProfilePhoto();

  return buildProfileSummary(account, studies, photo);
}

async function resolveProfilePhoto(): Promise<string> {
  const userKey = (await getLastUsername()) ?? undefined;
  const cached = getCachedProfilePhoto(userKey);
  if (cached) {
    return cached;
  }

  const photo = await fetchAvatarPhoto(userKey);
  if (photo) {
    setCachedProfilePhoto(photo, userKey);
  }
  return photo;
}

export async function parseProfileBundle(): Promise<{
  summary: ProfileSummary;
  profile: CompleteProfileData;
}> {
  const [accountHtml, studiesHtml, photo] = await Promise.all([
    fetchAccountDetailsPage(),
    fetchStudiesPage(),
    resolveProfilePhoto(),
  ]);

  assertAuthenticatedHtml(accountHtml);
  assertAuthenticatedHtml(studiesHtml);

  const account = parseAccountDetailsFromHtml(accountHtml);
  const studies = parseStudiesDataFromHtml(studiesHtml);

  return {
    summary: buildProfileSummary(account, studies, photo),
    profile: { ...account, ...studies },
  };
}

export async function parseAccountDetails(): Promise<AccountData> {
  const html = await fetchAccountDetailsPage();
  return parseAccountDetailsFromHtml(html);
}

export function parseStudiesDataFromHtml(html: string): StudiesData {
  const doc = parseDocument(html);
  const studiesTbody = findCardTableByHeading(doc, "Dane dotycz");
  const data = studiesTbody ? tableRowsFromTbody(studiesTbody) : {};

  const yearSemesterText = rowValue(data, "Rok/semestr:", "Rok/semestr");
  const [year, semester] = yearSemesterText.split("/").map((s) => s.trim());

  return {
    studyTrack: rowValue(data, "Tok studiów:", "Tok studiów"),
    albumNumber: rowValue(data, "Numer albumu:", "Numer albumu"),
    legitimationNumber: rowValue(
      data,
      "Numer legitymacji:",
      "Numer legitymacji"
    ),
    studentStatus: rowValue(data, "Status studenta:", "Status studenta"),
    year: year || "",
    semester: semester || "",
    studyMode: rowValue(data, "Tryb studiów:", "Tryb studiów"),
    faculty: rowValue(data, "Wydział:", "Wydział"),
    major: rowValue(data, "Kierunek:", "Kierunek"),
    specialization: rowValue(data, "Specjalność:", "Specjalność"),
    title: rowValue(data, "Uzyskiwany tytuł:", "Uzyskiwany tytuł"),
    enrollmentSemester: rowValue(
      data,
      "Semestr akademicki naboru:",
      "Semestr akademicki naboru"
    ),
    studiesStartDate: rowValue(
      data,
      "Data rozpoczęcia studiów:",
      "Data rozpoczęcia studiów"
    ),
    studiesEndDate: rowValue(
      data,
      "Przewidywana data zakończenia studiów:",
      "Przewidywana data zakończenia studiów"
    ),
    individualTrack: rowValue(data, "Tok indywidualny:", "Tok indywidualny"),
    contractNumber: rowValue(data, "Numer i data umowy:", "Numer i data umowy"),
  };
}

export async function parseStudiesData(): Promise<StudiesData> {
  const html = await fetchStudiesPage();
  return parseStudiesDataFromHtml(html);
}

export async function parseCompleteProfile(): Promise<CompleteProfileData> {
  const [accountHtml, studiesHtml] = await Promise.all([
    fetchAccountDetailsPage(),
    fetchStudiesPage(),
  ]);

  assertAuthenticatedHtml(accountHtml);
  assertAuthenticatedHtml(studiesHtml);

  return {
    ...parseAccountDetailsFromHtml(accountHtml),
    ...parseStudiesDataFromHtml(studiesHtml),
  };
}
