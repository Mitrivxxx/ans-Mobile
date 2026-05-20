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

export function buildLoginThrowableDiagnosticMessage(error: unknown): string {
  const axiosErr = error as AxiosError | undefined;
  const code = axiosErr?.code ?? '';
  const rawMessage =
    axiosErr?.message ?? (error instanceof Error ? error.message : String(error ?? ''));
  const message = rawMessage.toLowerCase();
  const technical = [code && `code=${code}`, rawMessage && `msg=${rawMessage}`]
    .filter(Boolean)
    .join(', ');

  if (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message.includes('timeout') ||
    message.includes('timed out')
  ) {
    return `Przekroczono czas oczekiwania na serwer logowania. Możliwe przyczyny: niestabilna sieć, wolny DNS, chwilowa niedostępność serwera. (${technical || 'timeout'})`;
  }

  if (
    message.includes('ssl') ||
    message.includes('tls') ||
    message.includes('certificate') ||
    message.includes('trust anchor') ||
    message.includes('hostname not verified')
  ) {
    return `Błąd bezpiecznego połączenia TLS/SSL z serwerem. Sprawdź datę i godzinę telefonu, VPN/antywirusa oraz aktualizacje systemu. (${technical || 'tls_error'})`;
  }

  if (
    message.includes('unable to resolve host') ||
    message.includes('name or service not known') ||
    message.includes('dns')
  ) {
    return `Nie udało się odnaleźć adresu serwera (problem DNS). Spróbuj zmienić sieć (Wi-Fi/LTE) lub wyłączyć Private DNS. (${technical || 'dns_error'})`;
  }

  if (message.includes('failed to connect') || message.includes('connection refused')) {
    return `Połączenie z serwerem zostało odrzucone lub przerwane. Możliwe: zapora sieciowa, VPN lub chwilowy problem po stronie sieci/operatora. (${technical || 'connect_error'})`;
  }

  if (
    code === 'ERR_NETWORK' ||
    message === 'network error' ||
    message.includes('network request failed') ||
    (!axiosErr?.response && Boolean(axiosErr?.request))
  ) {
    return `Nie udało się nawiązać połączenia sieciowego z serwerem logowania. Sprawdź internet, VPN, DNS i ustawienia oszczędzania baterii dla aplikacji. (${technical || 'network_error'})`;
  }

  return `Błąd połączenia podczas logowania. (${technical || 'unknown_network_error'})`;
}
