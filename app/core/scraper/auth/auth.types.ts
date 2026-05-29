export type LoginWdOptions = {
  captcha?: string;
  continuationHtml?: string;
};

import type { LoginErrorCode } from './login.errors';

import type { LoginContextOption } from './contextSelection.parser';

export type LoginResult = {
  success: boolean;
  errorCode?: LoginErrorCode;
  error?: string;
  requiresCaptcha?: boolean;
  continuationHtml?: string;
  captchaImageUrl?: string | null;
  /** Po poprawnym haśle portal wymaga wyboru kierunku / roli. */
  requiresContextSelection?: boolean;
  contextOptions?: LoginContextOption[];
};
