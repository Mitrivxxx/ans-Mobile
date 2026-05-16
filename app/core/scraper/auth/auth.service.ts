import type { AxiosResponse } from "axios";

import {
  WD_BASE_URL,
  client as httpClient,
  getCookies as getAxiosCookieHeader,
  setSessionCookies,
} from "../client/client";
import {
  getCookiesFromManager,
  hasAuthenticationCookie,
  mergeAuthCookiesFromNativeIfNeeded,
  showCookies,
  syncAxiosCookiesToNative,
} from "../client/cookies";

import type { LoginResult, LoginWdOptions } from "./auth.types";
import {
  appendCaptchaFields,
  buildCaptchaRequiredResult,
  isCaptchaRequiredInHtml,
} from "./captcha.parser";
import {
  extractVerificationToken,
  hasRequiredSessionCookies,
} from "./csrf.parser";
import {
  extractMvcLoginErrorSummary,
  isLoginFormHtml,
  loginPostLooksSuccessful,
} from "./login.parser";
import { logout as performLogout } from "./logout";
import {
  clearSession,
  getNativeCookieHeader,
  isSessionAuthenticated,
} from "./session.store";

const LOGIN_URL = `${WD_BASE_URL}/Logowanie`;

const LOGIN_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0.0.0 Safari/537.36";

async function loginWD(
  username: string,
  password: string,
  options?: LoginWdOptions
): Promise<LoginResult> {
  try {
    const useContinuation = Boolean(options?.continuationHtml?.trim());

    let loginPageHtml = "";

    if (useContinuation) {
      loginPageHtml = options!.continuationHtml!.trim();
    } else {
      try {
        const getRes = await httpClient.get<string>("/Logowanie", {
          responseType: "text",
          transformResponse: [(data) => data],
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "User-Agent": LOGIN_USER_AGENT,
          },
          maxRedirects: 5,
        });

        if (getRes.status !== 200) {
          console.log("Logowanie się nie powiodło");
          return {
            success: false,
            error: `STEP 1 FAILED: status=${getRes.status}`,
          };
        }

        loginPageHtml =
          typeof getRes.data === "string"
            ? getRes.data
            : String(getRes.data ?? "");

        await syncAxiosCookiesToNative();
      } catch (error: any) {
        console.log("Logowanie się nie powiodło");
        return {
          success: false,
          error: `STEP 1 FAILED: ${error.message}`,
        };
      }
    }

    let verificationToken: string | null = null;

    try {
      verificationToken = extractVerificationToken(loginPageHtml);

      if (!verificationToken) {
        console.log("Logowanie się nie powiodło");
        const hasLoginFields =
          /name=["']Username["']/i.test(loginPageHtml) &&
          /name=["']Password["']/i.test(loginPageHtml);
        const hint = hasLoginFields
          ? "Jest formularz, ale token ma nietypowy format w HTML."
          : "Zwykle serwer zwrócił inną stronę (np. główną) zamiast formularza logowania — włączyliśmy GET bez starych ciasteczek; spróbuj „Wyloguj” w aplikacji lub wyczyść dane wd.ans-ns.edu.pl.";
        return {
          success: false,
          error: `STEP 2 FAILED: Nie znaleziono __RequestVerificationToken. ${hint}`,
        };
      }
    } catch (error: any) {
      console.log("Logowanie się nie powiodło");
      return {
        success: false,
        error: `STEP 2 FAILED: ${error.message}`,
      };
    }

    try {
      const jar = getAxiosCookieHeader();
      await syncAxiosCookiesToNative();

      if (!hasRequiredSessionCookies(jar)) {
        console.log("Logowanie się nie powiodło");
        return {
          success: false,
          error:
            "STEP 3 FAILED: W jar brakuje ASP.NET_SessionId lub __RequestVerificationToken (anty-CSRF).",
        };
      }
    } catch (error: any) {
      console.log("Logowanie się nie powiodło");
      return {
        success: false,
        error: `STEP 3 FAILED: ${error.message}`,
      };
    }

    if (
      useContinuation &&
      isCaptchaRequiredInHtml(loginPageHtml) &&
      !options?.captcha?.trim()
    ) {
      return buildCaptchaRequiredResult(
        loginPageHtml,
        "Podaj kod CAPTCHA przed ponowną próbą logowania."
      );
    }

    if (
      !useContinuation &&
      !options?.captcha?.trim() &&
      isCaptchaRequiredInHtml(loginPageHtml)
    ) {
      return buildCaptchaRequiredResult(
        loginPageHtml,
        "Na stronie logowania wymagana jest CAPTCHA — wpisz kod z obrazka."
      );
    }

    let formData: URLSearchParams;

    try {
      formData = new URLSearchParams();
      formData.append("__RequestVerificationToken", verificationToken);
      formData.append("Username", username);
      formData.append("Password", password);
      appendCaptchaFields(formData, loginPageHtml, options?.captcha);
    } catch (error: any) {
      console.log("Logowanie się nie powiodło");
      return {
        success: false,
        error: `STEP 4 FAILED: ${error.message}`,
      };
    }

    let postRes: AxiosResponse<string>;

    try {
      postRes = await httpClient.post<string>(
        "/Logowanie",
        formData.toString(),
        {
          responseType: "text",
          transformResponse: [(data) => data],
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: WD_BASE_URL,
            Referer: LOGIN_URL,
            "User-Agent": LOGIN_USER_AGENT,
          },
          maxRedirects: 0,
        }
      );

      await syncAxiosCookiesToNative();
      await mergeAuthCookiesFromNativeIfNeeded();
    } catch (error: any) {
      console.log("Logowanie się nie powiodło");
      return {
        success: false,
        error: `STEP 5 FAILED: ${error.message}`,
      };
    }

    let authCookies = "";

    try {
      authCookies = await getCookiesFromManager();
    } catch (error: any) {
      console.log("Logowanie się nie powiodło");
      return {
        success: false,
        error: `STEP 6 FAILED: ${error.message}`,
      };
    }

    await mergeAuthCookiesFromNativeIfNeeded();

    const hasCorrectStatus = loginPostLooksSuccessful(postRes);
    const hasAuthCookie =
      hasAuthenticationCookie(authCookies) ||
      hasAuthenticationCookie(getAxiosCookieHeader());

    const success = hasCorrectStatus && hasAuthCookie;

    if (!success) {
      const responseText =
        typeof postRes.data === "string"
          ? postRes.data
          : String(postRes.data ?? "");
      const lower = responseText.toLowerCase();
      let detail = `status=${postRes.status}`;
      if (postRes.status === 200) {
        if (lower.includes("hasło") || lower.includes("haslo"))
          detail += "; strona może zawierać komunikat o błędzie logowania";
        if (lower.includes("token"))
          detail += "; możliwy problem z anty-CSRF";
        if (/<title>[\s\S]*error/i.test(responseText))
          detail += "; serwer zwrócił stronę Error (np. walidacja anty-CSRF)";
        if (isLoginFormHtml(responseText))
          detail += "; nadal formularz logowania (np. złe hasło)";
      }
      if (!hasCorrectStatus)
        detail += "; brak ciasteczka auth lub nadal strona logowania";

      console.log("Logowanie się nie powiodło");

      if (isCaptchaRequiredInHtml(responseText)) {
        return buildCaptchaRequiredResult(
          responseText,
          `Logowanie nieudane — ${detail}`
        );
      }

      const serverMsg = extractMvcLoginErrorSummary(responseText);
      return {
        success: false,
        requiresCaptcha: false,
        error: serverMsg ?? `Logowanie nieudane — ${detail}`,
      };
    }

    await setSessionCookies(getAxiosCookieHeader());

    console.log("Udało się zalogować");
    await showCookies("po logowaniu");

    return {
      success: true,
    };
  } catch (error: any) {
    console.log("Logowanie się nie powiodło");

    return {
      success: false,
      error: error.message,
    };
  }
}

export class AuthService {
  async login(
    username: string,
    password: string,
    options?: LoginWdOptions
  ): Promise<LoginResult> {
    const skipClear = Boolean(options?.continuationHtml?.trim());
    if (!skipClear) {
      await clearSession();
    }

    return loginWD(username, password, options);
  }

  async logout(): Promise<void> {
    return performLogout();
  }

  async getCookies(): Promise<string | null> {
    return getNativeCookieHeader();
  }

  async isAuthenticated(): Promise<boolean> {
    return isSessionAuthenticated();
  }
}
