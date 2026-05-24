export type LoginWdOptions = {
  captcha?: string;
  continuationHtml?: string;
};

import type { LoginErrorCode } from './login.errors';

export type LoginResult = {
  success: boolean;
  errorCode?: LoginErrorCode;
  error?: string;
  requiresCaptcha?: boolean;
  continuationHtml?: string;
  captchaImageUrl?: string | null;
};
