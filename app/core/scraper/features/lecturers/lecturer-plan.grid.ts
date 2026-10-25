import qs from "qs";

import { client, WD_BASE_URL } from "../../client/client";
import { mergeAuthCookiesFromNativeIfNeeded } from "../../client/cookies";
import { parseDxResponse } from "../../parsers/dx.parser";
import { getSemesterPlanParams } from "../plan/plan.dateRange";

const GRID_NAME = "gridViewPlanyProwadzacych";

const CALLBACK_ARG =
  "c0:KV|2;[];GB|35;14|CUSTOMCALLBACK15|[object Object];";

function lecturerPlanPath(scheduleId: string): string {
  return `/Plany/PlanyProwadzacych/${scheduleId}`;
}

function lecturerPlanReferer(scheduleId: string): string {
  return `${WD_BASE_URL}${lecturerPlanPath(scheduleId)}`;
}

function gridCustomPath(scheduleId: string): string {
  return `/Plany/PlanyProwadzacychGridCustom/${scheduleId}`;
}

/**
 * Ten sam zakres semestru co plan studenta (`getSemesterPlanParams`),
 * plus `scheduleId` wymagany przez PlanyProwadzacychGridCustom.
 * Przy zmianie semestru daty liczą się automatycznie z bieżącej daty.
 */
export function buildLecturerParametry(
  scheduleId: string,
  referenceDate: Date = new Date()
): string {
  const { dateFrom, dateTo, planType } = getSemesterPlanParams(referenceDate);
  return `${dateFrom};${dateTo};${planType};${scheduleId}`;
}

export function extractLecturerGridState(html: string): {
  customOperationState: string;
  callbackState: string;
} {
  const idx = html.indexOf(GRID_NAME);
  const block = idx >= 0 ? html.slice(idx, idx + 25000) : html;

  const customMatch = block.match(
    /['"]customOperationState['"]\s*:\s*['"]([^'"]*)['"]/i
  );
  const callbackMatch = block.match(
    /['"]callbackState['"]\s*:\s*['"]([^'"]*)['"]/i
  );

  return {
    customOperationState: customMatch?.[1] ?? "",
    callbackState: callbackMatch?.[1] ?? "",
  };
}

export function normalizeLecturerGridResponse(raw: string): string {
  if (!raw.includes("/*DXHTML*/")) {
    return raw;
  }
  try {
    return parseDxResponse(raw).html;
  } catch {
    const marker = "/*DXHTML*/";
    return raw.slice(raw.indexOf(marker) + marker.length);
  }
}

export async function fetchLecturerPlanPage(
  scheduleId: string
): Promise<string> {
  await mergeAuthCookiesFromNativeIfNeeded();

  const res = await client.get(lecturerPlanPath(scheduleId), {
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: `${WD_BASE_URL}/TokStudiow/StudentZnajdzOsobe/ZnajdzProwadzacego`,
    },
  });

  return typeof res.data === "string" ? res.data : String(res.data ?? "");
}

function buildGridPostBody(
  scheduleId: string,
  parametry: string,
  customOperationState: string,
  callbackState: string
): string {
  const gridJson = {
    customOperationState,
    keys: [] as string[],
    callbackState,
    groupLevelState: {},
    selection: "",
    toolbar: null as null,
    contextMenu: null as null,
  };

  return qs.stringify({
    DXCallbackName: GRID_NAME,
    __DXCallbackArgument: CALLBACK_ARG,
    [GRID_NAME]: JSON.stringify(gridJson),
    [`${GRID_NAME}$custwindowState`]: JSON.stringify({
      windowsState: "0:0:-1:0:0:0:-10000:-10000:1:0:0:0",
    }),
    [`${GRID_NAME}$DXHFPState`]: JSON.stringify({
      windowsState: "0:0:-1:0:0:0:-10000:-10000:1:0:0:0",
    }),
    [`${GRID_NAME}$DXHFP$TPCFCm1$O`]: "Ustaw",
    [`${GRID_NAME}$DXHFP$TPCFCm1$C`]: "Zaniechaj",
    DXMVCEditorsValues: "{}",
    parametry,
    id: scheduleId,
  });
}

/**
 * POST jak „Szukaj” — tylko PlanyProwadzacychGridCustom/{id}.
 */
export async function postLecturerPlanGrid(
  scheduleId: string,
  pageHtml: string
): Promise<string> {
  const parametry = buildLecturerParametry(scheduleId);
  const { customOperationState, callbackState } =
    extractLecturerGridState(pageHtml);

  const body = buildGridPostBody(
    scheduleId,
    parametry,
    customOperationState,
    callbackState
  );

  const res = await client.post(gridCustomPath(scheduleId), body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "*/*",
      Referer: lecturerPlanReferer(scheduleId),
      Origin: WD_BASE_URL,
    },
  });

  return typeof res.data === "string" ? res.data : String(res.data ?? "");
}
