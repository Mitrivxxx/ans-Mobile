import { describe, expect, it } from "vitest";

import {
  parseGroupsSemesterOptions,
  parseSelectedGroupsSemester,
  parseStudentGroupsTable,
  resolveSemesterOption,
} from "../../app/core/scraper/features/groups/groups.parse";
import { readFixture } from "../helpers/readFixture";

const fixture = readFixture("profile-groups.html");

describe("parseStudentGroupsTable", () => {
  it("parsuje formę zajęć i kod grupy", () => {
    const groups = parseStudentGroupsTable(fixture);

    expect(groups).toEqual([
      { activityForm: "Tok", groupCode: "2023-2027 ISS" },
      { activityForm: "Ćwiczenia", groupCode: "C1/IS/s/2023S" },
      { activityForm: "Laboratorium", groupCode: "L2/IS/s/2023S" },
      { activityForm: "Projekt", groupCode: "P2/IS/s/2023S" },
    ]);
  });
});

describe("parseGroupsSemesterOptions", () => {
  it("parsuje itemsInfo z DevExpress", () => {
    const options = parseGroupsSemesterOptions(fixture);

    expect(options).toEqual([
      { id: "82", label: "2025/2026 zimowy" },
      { id: "83", label: "2025/2026 letni" },
    ]);
  });
});

describe("parseSelectedGroupsSemester", () => {
  it("czyta aktualnie wybrany semestr ze strony", () => {
    const options = parseGroupsSemesterOptions(fixture);
    const selected = parseSelectedGroupsSemester(fixture, options);

    expect(selected).toEqual({ id: "83", label: "2025/2026 letni" });
  });
});

describe("resolveSemesterOption", () => {
  it("dopasowuje semestr akademicki z ocen", () => {
    const options = parseGroupsSemesterOptions(fixture);
    const resolved = resolveSemesterOption(options, "2025/2026 letni");

    expect(resolved).toEqual({ id: "83", label: "2025/2026 letni" });
  });
});
