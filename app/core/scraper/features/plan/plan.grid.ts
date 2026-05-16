import qs from 'qs';
import { client } from '../../client/client';

interface GridState {
  customOperationState: string;
  callbackState: string;
}

const EMPTY_STATE: GridState = {
  customOperationState: '',
  callbackState: ''
};

export async function initPlanSession(
  dateFrom: string = '2026-2-19',
  dateTo: string = '2026-9-30',
  planType: string = '3'
): Promise<void> {

  await client.get('/Plany/PlanyStudentow');

  const payload = qs.stringify({
    parametry: `${dateFrom};${dateTo};${planType}`
  });

  await client.post(
    '/Plany/PlanyStudentow',
    payload,
    {
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',
        Referer:
          'https://wd.ans-ns.edu.pl/Plany/PlanyStudentow'
      }
    }
  );
}

export async function fetchGrid(
  state: GridState = EMPTY_STATE
): Promise<string> {

  const payload = qs.stringify({
    DXCallbackName: 'gridViewPlanyStudentow',

    __DXCallbackArgument:
      'c0:KV|2;[];GB|35;14|CUSTOMCALLBACK15|[object Object];',

    gridViewPlanyStudentow: JSON.stringify({
      customOperationState:
        state.customOperationState,

      keys: [],

      callbackState:
        state.callbackState,

      groupLevelState: {},

      selection: '',

      toolbar: null,

      contextMenu: null
    }),

    'gridViewPlanyStudentow$custwindowState':
      JSON.stringify({
        windowsState:
          '0:0:-1:0:0:0:-10000:-10000:1:0:0:0'
      }),

    'gridViewPlanyStudentow$DXHFPState':
      JSON.stringify({
        windowsState:
          '0:0:-1:0:0:0:-10000:-10000:1:0:0:0'
      }),

    DXMVCEditorsValues: '{}',

    parametry:
      '2026-2-19;2026-9-30;3'
  });

  const res = await client.post(
    '/Plany/PlanyStudentowGridCustom',
    payload,
    {
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',

        'X-Requested-With':
          'XMLHttpRequest',

        Referer:
          'https://wd.ans-ns.edu.pl/Plany/PlanyStudentow'
      }
    }
  );

  return res.data;
}
