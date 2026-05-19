import qs from 'qs';
import { client } from '../../client/client';
import type { PlanFetchParams } from './plan.dateRange';
import { getSemesterPlanParams } from './plan.dateRange';

interface GridState {
  customOperationState: string;
  callbackState: string;
}

const EMPTY_STATE: GridState = {
  customOperationState: '',
  callbackState: '',
};

function formatParametry({ dateFrom, dateTo, planType }: PlanFetchParams): string {
  return `${dateFrom};${dateTo};${planType}`;
}

export async function initPlanSession(
  params: PlanFetchParams = getSemesterPlanParams()
): Promise<void> {
  const parametry = formatParametry(params);

  await client.get('/Plany/PlanyStudentow');

  const payload = qs.stringify({ parametry });

  await client.post('/Plany/PlanyStudentow', payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'https://wd.ans-ns.edu.pl/Plany/PlanyStudentow',
    },
  });
}

export async function fetchGrid(
  state: GridState = EMPTY_STATE,
  params: PlanFetchParams = getSemesterPlanParams()
): Promise<string> {
  const parametry = formatParametry(params);

  const payload = qs.stringify({
    DXCallbackName: 'gridViewPlanyStudentow',

    __DXCallbackArgument:
      'c0:KV|2;[];GB|35;14|CUSTOMCALLBACK15|[object Object];',

    gridViewPlanyStudentow: JSON.stringify({
      customOperationState: state.customOperationState,
      keys: [],
      callbackState: state.callbackState,
      groupLevelState: {},
      selection: '',
      toolbar: null,
      contextMenu: null,
    }),

    'gridViewPlanyStudentow$custwindowState': JSON.stringify({
      windowsState: '0:0:-1:0:0:0:-10000:-10000:1:0:0:0',
    }),

    'gridViewPlanyStudentow$DXHFPState': JSON.stringify({
      windowsState: '0:0:-1:0:0:0:-10000:-10000:1:0:0:0',
    }),

    DXMVCEditorsValues: '{}',

    parametry,
  });

  const res = await client.post('/Plany/PlanyStudentowGridCustom', payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://wd.ans-ns.edu.pl/Plany/PlanyStudentow',
    },
  });

  return res.data;
}
