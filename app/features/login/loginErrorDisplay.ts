import type { LoginErrorCode } from '../../core/scraper/auth/login.errors';

const LOGIN_ERROR_MESSAGES: Record<
  Exclude<LoginErrorCode, 'empty_username' | 'empty_password'>,
  string
> = {
  no_internet: 'Brak połączenia z internetem. Sprawdź sieć i spróbuj ponownie.',
  timeout:
    'Przekroczono czas oczekiwania na serwer. Sprawdź połączenie i spróbuj ponownie.',
  forbidden:
    'Dostęp został zablokowany (403). Skontaktuj się z dziekanatem lub spróbuj później.',
  invalid_credentials: 'Nieprawidłowy login lub hasło.',
};

export const REQUIRED_FIELD_MESSAGE = 'To pole jest wymagane';

export function getLoginErrorMessage(code: LoginErrorCode): string {
  if (code === 'empty_username' || code === 'empty_password') {
    return REQUIRED_FIELD_MESSAGE;
  }
  return LOGIN_ERROR_MESSAGES[code];
}
