export type LoginWdOptions = {
  /** Kod z obrazka CAPTCHA */
  captcha?: string;
  /** HTML z ostatniej odpowiedzi (GET lub POST) — ten sam stan sesji co przy wyświetleniu CAPTCHA */
  continuationHtml?: string;
};

export type LoginResult = {
  success: boolean;
  error?: string;
  /** Serwer wymaga CAPTCHA — pokaż obrazek i ponów logowanie z `captcha` + `continuationHtml` */
  requiresCaptcha?: boolean;
  continuationHtml?: string;
  captchaImageUrl?: string | null;
};
