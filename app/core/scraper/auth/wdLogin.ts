// wdLogin.ts

import CookieManager from '@react-native-cookies/cookies';
import { Platform } from 'react-native';

import type { AxiosResponse } from 'axios';

import {
  clearCookies,
  client as httpClient,
  getCookies as getAxiosCookieHeader,
  mergeCookieHeaderIntoJar,
  setSessionCookies,
} from '../client';

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

const BASE_URL = "https://wd.ans-ns.edu.pl";
const LOGIN_URL = "https://wd.ans-ns.edu.pl/Logowanie";

function hasAuthenticationCookie(cookieHeader: string): boolean {
  return (
    cookieHeader.includes(".AspNet.Cookies") ||
    cookieHeader.includes(".ASPXAUTH") ||
    cookieHeader.includes(".AspNet.ApplicationCookie")
  );
}

/** Zapisuje bieżący cookieJar axios do CookieManager (isAuthenticated / fetch poza axios). */
async function syncAxiosCookiesToNative(): Promise<void> {
  const header = getAxiosCookieHeader();
  if (!header) return;

  for (const part of header.split("; ").filter(Boolean)) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    try {
      await CookieManager.set(BASE_URL, {
        name,
        value,
        path: "/",
        secure: true,
      });
    } catch {
      /* pojedyncze ciasteczko */
    }
  }

  if (Platform.OS === "android") {
    try {
      await CookieManager.flush();
    } catch {
      /* */
    }
  }
}

function debug(title: string, data?: any) {
  console.log(`\n========== ${title} ==========`);

  if (data !== undefined) {
    console.log(data);
  }
}

function logStep(stepNumber: number | string, description: string, success: boolean, details?: any) {
  const icon = success ? "✓" : "✗";
  const status = success ? "SUKCES" : "BŁĄD";
  
  console.log(`\n[STEP ${stepNumber}] ${icon} ${description} - ${status}`);
  
  if (details !== undefined) {
    console.log("Details:", details);
  }
}

function extractVerificationToken(html: string): string | null {
  const patterns = [
    /name="__RequestVerificationToken"\s+type="hidden"\s+value="([^"]+)"/i,
    /type="hidden"\s+name="__RequestVerificationToken"\s+value="([^"]+)"/i,
    /name="__RequestVerificationToken"[^>]*value="([^"]+)"/i,
    /name="__RequestVerificationToken"[^>]*value='([^']+)'/i,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Czy HTML wygląda na formularz logowania (np. błędne hasło → nadal ta sama strona). */
function isLoginFormHtml(html: string): boolean {
  return (
    /name=["']Username["']/i.test(html) &&
    /name=["']Password["']/i.test(html) &&
    /__RequestVerificationToken/i.test(html)
  );
}

/** OkHttp może zapisać .AspNet.Cookies w CookieManager zanim pojawi się w ręcznym jar axios. */
async function mergeAuthCookiesFromNativeIfNeeded(): Promise<void> {
  const jar = getAxiosCookieHeader();
  if (hasAuthenticationCookie(jar)) return;
  const native = await getCookiesFromManager(BASE_URL);
  if (!native || !hasAuthenticationCookie(native)) return;
  mergeCookieHeaderIntoJar(native);
}

/**
 * Na Androidzie axios często i tak podąża za 302 — wtedy status=200 i duży HTML (np. strona główna).
 * Sukces: brak formularza logowania + ciasteczko auth w jar (po ewentualnym scalaeniu z CookieManager).
 */
function loginPostLooksSuccessful(res: AxiosResponse<string>): boolean {
  const html =
    typeof res.data === "string" ? res.data : String(res.data ?? "");
  const jar = getAxiosCookieHeader();

  if (res.status === 302) {
    return hasAuthenticationCookie(jar);
  }

  if (res.status === 200) {
    if (isLoginFormHtml(html)) return false;
    return hasAuthenticationCookie(jar);
  }

  return false;
}

function isCaptchaRequiredInHtml(html: string): boolean {
  const hints =
    /name=["']captcha["']/i.test(html) ||
    /id=["']captchaImg["']/i.test(html) ||
    /\/Shared\/Captcha\?/i.test(html) ||
    /data-valmsg-for=["']captcha["']/i.test(html) ||
    /data-valmsg-for=["']Captcha["']/i.test(html) ||
    /wpisz kod z obrazka/i.test(html) ||
    /nieprawidłowy kod z obrazka/i.test(html) ||
    /nieprawidlowy kod z obrazka/i.test(html);

  if (!hints) return false;

  return (
    /name=["']Username["']/i.test(html) ||
    /name=["']Password["']/i.test(html) ||
    /action=["'][^"']*Logowanie/i.test(html)
  );
}

/** Tekst błędu z podsumowania walidacji MVC (logowanie bez CAPTCHA). */
function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMvcLoginErrorSummary(html: string): string | null {
  const summary = html.match(
    /class=["']validation-summary-errors["'][^>]*>([\s\S]*?)<\/ul>/i
  );
  if (summary?.[1]) {
    const items = [...summary[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) => stripTags(m[1]))
      .filter((t) => t.length > 2 && t.length < 400);
    if (items.length) return items.join(" ");
  }

  const spans = [
    ...html.matchAll(
      /<span[^>]*class=["'][^"']*field-validation-error[^"']*["'][^>]*data-valmsg-for=["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>/gi
    ),
  ];
  const parts: string[] = [];
  for (const m of spans) {
    const field = (m[1] || "").trim();
    const msg = stripTags(m[2] || "");
    if (msg.length > 2 && msg.length < 400) {
      parts.push(field ? `${field}: ${msg}` : msg);
    }
  }
  if (parts.length) return [...new Set(parts)].join(" ");

  return null;
}

function resolveCaptchaImageUrl(html: string): string | null {
  const img = html.match(
    /id=["']captchaImg["'][^>]*\ssrc=["']([^"']+)["']/i
  ) ?? html.match(/id=["']captchaImg["'][^>]*src=["']([^"']+)["']/i);
  if (img?.[1]) {
    const src = img[1].replace(/&amp;/g, "&");
    if (/^https?:\/\//i.test(src)) return src;
    return BASE_URL + (src.startsWith("/") ? src : `/${src}`);
  }
  const sh = html.match(/src=["'](\/Shared\/Captcha[^"']*)["']/i);
  if (sh?.[1]) {
    return BASE_URL + sh[1].replace(/&amp;/g, "&");
  }
  return null;
}

function extractGsf(html: string): string | null {
  const patterns = [
    /name=["']gsf["'][^>]*value=["']([^"']*)["']/i,
    /name=["']gsf["'][^>]*value="([^"]*)"/i,
    /value=["']([^"']*)["'][^>]*name=["']gsf["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] !== undefined) return m[1];
  }
  return null;
}

function buildCaptchaRequiredResult(html: string, baseError?: string): LoginResult {
  return {
    success: false,
    requiresCaptcha: true,
    continuationHtml: html,
    captchaImageUrl: resolveCaptchaImageUrl(html),
    error: baseError ?? "Wymagana weryfikacja CAPTCHA — wpisz kod z obrazka.",
  };
}

/**
 * Pobranie cookies z CookieManager
 * @param url URL dla którego pobieramy cookies
 * @returns Sformatowany string z cookies
 */
async function getCookiesFromManager(url: string): Promise<string> {
  try {
    const cookies = await CookieManager.get(url);

    const cookieArray = Object.values(cookies).map((c) => `${c.name}=${c.value}`);
    
    const cookieString = cookieArray.join("; ");
    
    debug("COOKIES FROM MANAGER", {
      count: cookieArray.length,
      preview: cookieString.substring(0, 100),
    });
    
    return cookieString;
  } catch (error: any) {
    debug("ERROR GETTING COOKIES", error.message);
    return "";
  }
}

async function loginWD(
  username: string,
  password: string,
  options?: LoginWdOptions
): Promise<LoginResult> {
  try {
    console.log("\n\n╔════════════════════════════════════════╗");
    console.log("║   URUCHAMIANIE PROCESU LOGOWANIA       ║");
    console.log("╚════════════════════════════════════════╝\n");

    debug("START LOGIN", `Username: ${username}`);
    debug("START LOGIN", `Password: ${password}`);

    const useContinuation = Boolean(options?.continuationHtml?.trim());

    //
    // STEP 1
    // GET LOGIN PAGE (pomijane przy kontynuacji po CAPTCHA)
    //

    let step1Success = false;
    let loginPageHtml = "";
    let getRes: AxiosResponse<string> | undefined;

    if (useContinuation) {
      loginPageHtml = options!.continuationHtml!.trim();
      step1Success = true;
      console.log("\n>>> STEP 1: Pominięto GET — używamy HTML kontynuacji (CAPTCHA)");
      logStep(1, "GET pominięty (kontynuacja CAPTCHA)", true, {
        htmlLength: loginPageHtml.length,
      });
    } else {
      try {
        console.log("\n>>> STEP 1: Pobieranie strony logowania (axios)");

        getRes = await httpClient.get<string>("/Logowanie", {
          responseType: "text",
          transformResponse: [(data) => data],
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0.0.0 Safari/537.36",
          },
          maxRedirects: 5,
        });

        step1Success = getRes.status === 200;
        loginPageHtml =
          typeof getRes.data === "string"
            ? getRes.data
            : String(getRes.data ?? "");

        await syncAxiosCookiesToNative();

        logStep(1, "Pobieranie strony logowania", step1Success, {
          status: getRes.status,
          htmlLength: loginPageHtml.length,
        });

        debug("LOGIN PAGE HTML PREVIEW", loginPageHtml.substring(0, 1000));
      } catch (error: any) {
        logStep(1, "Pobieranie strony logowania", false, error.message);
        return {
          success: false,
          error: `STEP 1 FAILED: ${error.message}`,
        };
      }
    }

    //
    // STEP 2
    // EXTRACT TOKEN
    //

    let step2Success = false;
    let verificationToken: string | null = null;

    try {
      console.log("\n>>> STEP 2: Ekstrakcja tokenu weryfikacji");
      
      verificationToken = extractVerificationToken(loginPageHtml);
      step2Success = verificationToken !== null;

      logStep(2, "Ekstrakcja __RequestVerificationToken", step2Success, {
        token: verificationToken ? "✓ Znaleziono" : "✗ Nie znaleziono",
        tokenValue: verificationToken ? `${verificationToken.substring(0, 20)}...` : null,
      });

      debug("VERIFICATION TOKEN", verificationToken);

      if (!verificationToken) {
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
      logStep(2, "Ekstrakcja __RequestVerificationToken", false, error.message);
      return {
        success: false,
        error: `STEP 2 FAILED: ${error.message}`,
      };
    }

    //
    // STEP 3
    // EXTRACT INITIAL COOKIES
    //

    let step3Success = false;

    try {
      console.log(
        "\n>>> STEP 3: Ciasteczka po GET (axios — pełna lista Set-Cookie)"
      );

      const jar = getAxiosCookieHeader();
      debug("AXIOS COOKIE JAR AFTER GET", jar.substring(0, Math.min(240, jar.length)));

      step3Success =
        jar.length > 0 &&
        /\bASP\.NET_SessionId=/i.test(jar) &&
        /(^|; )__RequestVerificationToken=/i.test(jar);

      await syncAxiosCookiesToNative();

      logStep(
        3,
        "Sesja + cookie __RequestVerificationToken (wymagane z POST)",
        step3Success,
        {
          cookiesCount: jar.split("; ").filter(Boolean).length,
          source: "axios cookieJar",
        }
      );

      if (!step3Success) {
        return {
          success: false,
          error:
            "STEP 3 FAILED: W jar brakuje ASP.NET_SessionId lub __RequestVerificationToken (anty-CSRF).",
        };
      }
    } catch (error: any) {
      logStep(3, "Ciasteczka po GET", false, error.message);
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

    //
    // STEP 4
    // BUILD FORM DATA
    //

    let step4Success = false;
    let formData: URLSearchParams;

    try {
      console.log("\n>>> STEP 4: Budowanie danych formularza");
      
      formData = new URLSearchParams();

      formData.append("__RequestVerificationToken", verificationToken);
      formData.append("Username", username);
      formData.append("Password", password);

      const wantsCaptchaPayload =
        isCaptchaRequiredInHtml(loginPageHtml) ||
        Boolean(options?.captcha?.trim());

      const fieldsLogged = [
        "__RequestVerificationToken",
        "Username",
        "Password",
      ];

      if (wantsCaptchaPayload) {
        const gsf = extractGsf(loginPageHtml);
        if (gsf !== null && gsf !== "") {
          formData.append("gsf", gsf);
          fieldsLogged.push("gsf");
        }
        if (options?.captcha?.trim()) {
          formData.append("captcha", options.captcha.trim());
          fieldsLogged.push("captcha");
        }
      }

      step4Success = true;

      logStep(4, "Budowanie formularza logowania", step4Success, {
        fields: fieldsLogged,
        totalFields: fieldsLogged.length,
      });

      debug("FORM DATA", formData.toString());
    } catch (error: any) {
      logStep(4, "Budowanie formularza logowania", false, error.message);
      return {
        success: false,
        error: `STEP 4 FAILED: ${error.message}`,
      };
    }

    //
    // STEP 5
    // LOGIN POST
    //

    let step5Success = false;
    let postRes: AxiosResponse<string>;

    try {
      console.log("\n>>> STEP 5: Wysyłanie żądania logowania (POST axios)");

      postRes = await httpClient.post<string>(
        "/Logowanie",
        formData.toString(),
        {
          responseType: "text",
          transformResponse: [(data) => data],
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: BASE_URL,
            Referer: LOGIN_URL,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0.0.0 Safari/537.36",
          },
          maxRedirects: 0,
        }
      );

      await syncAxiosCookiesToNative();
      await mergeAuthCookiesFromNativeIfNeeded();

      step5Success = loginPostLooksSuccessful(postRes);

      logStep(5, "Wysyłanie żądania POST do /Logowanie", step5Success, {
        status: postRes.status,
        expected: "302 lub 200 z ciasteczkiem auth (po przekierowaniu)",
        hasAuthCookie: hasAuthenticationCookie(getAxiosCookieHeader()),
        stillLoginForm: isLoginFormHtml(
          typeof postRes.data === "string"
            ? postRes.data
            : String(postRes.data ?? "")
        ),
      });

      debug("LOGIN RESPONSE STATUS", postRes.status);
      debug("LOGIN RESPONSE HEADERS", JSON.stringify(postRes.headers, null, 2));
    } catch (error: any) {
      logStep(5, "Wysyłanie żądania POST do /Logowanie", false, error.message);
      return {
        success: false,
        error: `STEP 5 FAILED: ${error.message}`,
      };
    }

    //
    // STEP 6
    // EXTRACT AUTH COOKIES
    //

    let step6Success = false;
    let authCookies = "";

    try {
      console.log("\n>>> STEP 6: Ekstrakcja ciasteczek autentykacji z CookieManager");
      
      authCookies = await getCookiesFromManager(BASE_URL);
      const jarForAuth = getAxiosCookieHeader();
      step6Success =
        hasAuthenticationCookie(authCookies) ||
        hasAuthenticationCookie(jarForAuth);

      logStep(6, "Ekstrakcja ciasteczek autentykacji", step6Success, {
        cookiesCount: authCookies.split(";").length,
        hasAuthCookie: step6Success,
        source: "CookieManager lub axios jar",
      });

      debug("AUTH COOKIES", authCookies);
    } catch (error: any) {
      logStep(6, "Ekstrakcja ciasteczek autentykacji", false, error.message);
      return {
        success: false,
        error: `STEP 6 FAILED: ${error.message}`,
      };
    }

    //
    // STEP 7
    // CHECK LOGIN SUCCESS
    //

    console.log("\n>>> STEP 7: Sprawdzenie powodzenia logowania");

    await mergeAuthCookiesFromNativeIfNeeded();

    const hasCorrectStatus = loginPostLooksSuccessful(postRes);
    const hasAuthCookie =
      hasAuthenticationCookie(authCookies) ||
      hasAuthenticationCookie(getAxiosCookieHeader());
    const location =
      (postRes.headers?.location as string | undefined) ??
      (postRes.headers?.Location as string | undefined) ??
      "";

    logStep(7, "Odpowiedź logowania (302 lub 200 po przekierowaniu)", hasCorrectStatus, {
      actualStatus: postRes.status,
      hasAuthCookie,
      location: location || null,
    });

    logStep(
      "7.5",
      "Sprawdzenie ciasteczka uwierzytelniania",
      hasAuthCookie,
      { hasAuthCookie, preview: authCookies.substring(0, 120) }
    );

    const success = hasCorrectStatus && hasAuthCookie;

    logStep(7, "LOGOWANIE - KOŃCOWY REZULTAT", success, {
      statusCheck: hasCorrectStatus ? "✓" : "✗",
      cookieCheck: hasAuthCookie ? "✓" : "✗",
      finalResult: success ? "✓ SUKCES" : "✗ BŁĄD",
    });

    debug("LOGIN SUCCESS", success);

    if (!success) {
      const responseText =
        typeof postRes.data === "string"
          ? postRes.data
          : String(postRes.data ?? "");
      const lower = responseText.toLowerCase();
      let detail = `status=${postRes.status}`;
      if (postRes.status === 200) {
        if (lower.includes("hasło") || lower.includes("haslo")) detail += "; strona może zawierać komunikat o błędzie logowania";
        if (lower.includes("token")) detail += "; możliwy problem z anty-CSRF";
        if (/<title>[\s\S]*error/i.test(responseText)) detail += "; serwer zwrócił stronę Error (np. walidacja anty-CSRF)";
        if (isLoginFormHtml(responseText)) detail += "; nadal formularz logowania (np. złe hasło)";
      }
      if (!hasCorrectStatus) detail += "; brak ciasteczka auth lub nadal strona logowania";

      debug("FAILED LOGIN HTML", responseText.substring(0, 3000));

      console.log("\n╔════════════════════════════════════════╗");
      console.log("║   ✗ LOGOWANIE NIEUDANE                ║");
      console.log("╚════════════════════════════════════════╝\n");

      if (
        isCaptchaRequiredInHtml(responseText)
      ) {
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

    //
    // FINAL COOKIES - VERIFY IN COOKIE MANAGER
    //

    console.log("\n>>> STEP 8: Weryfikacja cookies w CookieManager");
    
    const finalCookies = await getCookiesFromManager(BASE_URL);
    const step8Success =
      hasAuthenticationCookie(finalCookies) ||
      hasAuthenticationCookie(getAxiosCookieHeader());
    
    logStep(8, "Weryfikacja cookies w CookieManager", step8Success, {
      cookiesCount: finalCookies.split(";").length,
      hasAspNetCookies: step8Success,
    });

    debug("FINAL COOKIES", finalCookies);

    await setSessionCookies(getAxiosCookieHeader());

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   ✓ LOGOWANIE POWIODŁO SIĘ!           ║");
    console.log("╚════════════════════════════════════════╝\n");

    return {
      success: true,
    };
  } catch (error: any) {
    debug("FATAL ERROR", error);

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   ✗ BŁĄD KRYTYCZNY                     ║");
    console.log("╚════════════════════════════════════════╝\n");

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * WdAuthService - Serwis autentykacji
 * Zarządza logowaniem i ciasteczkami sesji poprzez CookieManager
 */
export class WdAuthService {
  /**
   * Logowanie użytkownika
   * @param options.continuationHtml + options.captcha — ponowienie po wymogu CAPTCHA (bez czyszczenia cookies)
   */
  async login(
    username: string,
    password: string,
    options?: LoginWdOptions
  ): Promise<LoginResult> {
    console.log("\n\n╔════════════════════════════════════════╗");
    console.log("║   WdAuthService.login() - START        ║");
    console.log("╚════════════════════════════════════════╝\n");

    const skipClear = Boolean(options?.continuationHtml?.trim());
    if (!skipClear) {
      await this.clearAllCookies();
      console.log(
        ">>> Przed logowaniem: wyczyszczono wszystkie cookies (CookieManager + client)"
      );
    } else {
      console.log(
        ">>> Kontynuacja logowania (CAPTCHA) — bez czyszczenia cookies"
      );
    }

    const result = await loginWD(username, password, options);

    if (result.success) {
      console.log(
        "\n>>> Logowanie pomyślne — sesja w axios (AsyncStorage) + CookieManager"
      );
    } else {
      console.log("\n>>> Logowanie nieudane:", result.error);
    }

    return result;
  }

  /**
   * Usuwa wszystkie cookies (natywny CookieManager + cookieJar axios w AsyncStorage).
   */
  async clearAllCookies(): Promise<void> {
    try {
      await CookieManager.clearAll();
      await clearCookies();
      if (Platform.OS === "android") {
        try {
          await CookieManager.flush();
        } catch {
          /* ignore */
        }
      }
    } catch (error: any) {
      console.error(">>> Błąd przy czyszczeniu cookies:", error.message);
      throw error;
    }
  }

  /**
   * Wylogowanie użytkownika - czyszczenie cookies
   */
  async logout(): Promise<void> {
    console.log("\n\n╔════════════════════════════════════════╗");
    console.log("║   WdAuthService.logout() - START       ║");
    console.log("╚════════════════════════════════════════╝\n");

    try {
      await this.clearAllCookies();
      console.log(">>> Wszystkie cookies wyczyszczone (CookieManager + client)");
    } catch (error: any) {
      console.error(">>> Błąd przy czyszczeniu cookies:", error.message);
    }
  }

  /**
   * Pobranie cookies sesji z CookieManager
   * @returns Aktualnie przechowywane cookies
   */
  async getCookies(): Promise<string | null> {
    try {
      const cookies = await CookieManager.get(BASE_URL);
      return Object.values(cookies)
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
    } catch (error: any) {
      console.error(">>> Błąd przy pobieraniu cookies:", error.message);
      return null;
    }
  }

  /**
   * Sprawdzenie czy użytkownik jest zalogowany
   * @returns true jeśli mamy .AspNet.Cookies, false w przeciwnym razie
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const cookies = await CookieManager.get(BASE_URL);
      const header = Object.values(cookies)
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
      return hasAuthenticationCookie(header);
    } catch (error: any) {
      console.error(">>> Błąd przy sprawdzeniu autentykacji:", error.message);
      return false;
    }
  }
}