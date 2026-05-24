import axios from 'axios';

import { ANS_WEB_ORIGIN } from './events.constants';

const publicClient = axios.create({
  baseURL: ANS_WEB_ORIGIN,
  timeout: 20_000,
  validateStatus: (status) => status >= 200 && status < 500,
});

function responseBody(data: unknown): string {
  return typeof data === 'string' ? data : String(data ?? '');
}

export async function fetchAnsHomepageHtml(): Promise<string> {
  const response = await publicClient.get('/');
  if (response.status !== 200) {
    throw new Error(`Strona główna ANS zwróciła HTTP ${response.status}`);
  }
  return responseBody(response.data);
}
