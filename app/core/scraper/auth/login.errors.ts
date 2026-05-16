import type { AxiosError } from 'axios';

export const LOGIN_REQUEST_TIMEOUT_MS = 25_000;

export const LOGIN_ERROR_CODES = [
  'empty_username',
  'empty_password',
  'no_internet',
  'timeout',
  'forbidden',
  'invalid_credentials',
] as const;

export type LoginErrorCode = (typeof LOGIN_ERROR_CODES)[number];

export function isLoginErrorCode(value: string): value is LoginErrorCode {
  return (LOGIN_ERROR_CODES as readonly string[]).includes(value);
}

export function classifyLoginHttpStatus(
  status: number | undefined
): LoginErrorCode | undefined {
  if (status === 401) return 'invalid_credentials';
  if (status === 403) return 'forbidden';
  if (status === 408 || status === 504) return 'timeout';
  return undefined;
}

export function classifyLoginThrowable(
  error: unknown
): LoginErrorCode | undefined {
  const axiosErr = error as AxiosError | undefined;

  if (axiosErr?.response?.status) {
    const fromStatus = classifyLoginHttpStatus(axiosErr.response.status);
    if (fromStatus) return fromStatus;
  }

  const code = axiosErr?.code ?? '';
  const message = (axiosErr?.message ?? String(error ?? '')).toLowerCase();

  if (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message.includes('timeout') ||
    message.includes('timed out')
  ) {
    return 'timeout';
  }

  if (
    code === 'ERR_NETWORK' ||
    message === 'network error' ||
    message.includes('network request failed') ||
    message.includes('failed to connect') ||
    (!axiosErr?.response && Boolean(axiosErr?.request))
  ) {
    return 'no_internet';
  }

  return undefined;
}
