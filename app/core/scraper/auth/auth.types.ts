export type LoginWdOptions = {
  /** Kod z obrazka CAPTCHA */
  captcha?: string;
  /** HTML z ostatniej odpowiedzi (GET lub POST) — ten sam stan sesji co przy wyświetleniu CAPTCHA */
  continuationHtml?: string;
};

import type { LoginErrorCode } from './login.errors';

export type LoginResult = {
  success: boolean;
  /** Znany kod błędu (walidacja, sieć, HTTP 401/403 itd.) */
  errorCode?: LoginErrorCode;
  /** Komunikat serwera lub CAPTCHA — gdy brak `errorCode` */
  error?: string;
  /** Serwer wymaga CAPTCHA — pokaż obrazek i ponów logowanie z `captcha` + `continuationHtml` */
  requiresCaptcha?: boolean;
  continuationHtml?: string;
  captchaImageUrl?: string | null;
};
