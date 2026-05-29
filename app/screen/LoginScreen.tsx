import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { devLog } from '../config/devLog';
import { AuthService } from '../core/scraper/auth/auth.service';
import {
  classifyLoginThrowable,
  type LoginErrorCode,
} from '../core/scraper/auth/login.errors';
import { ansColors } from '../theme/ansTheme';
import LoginCaptchaSection from '../features/login/LoginCaptchaSection';
import LoginIconInput from '../features/login/LoginIconInput';
import LoginInfoButton from '../features/login/LoginInfoButton';
import { useAuthSession } from '../context/AuthSessionContext';
import { useLoginStoredCredentials } from '../features/login/hooks/useLoginStoredCredentials';
import { saveLastLoginContext } from '../core/auth/lastLoginContext.storage';
import { saveLastUsername } from '../core/auth/sessionUser.storage';
import { resetSilentLoginLimiter } from '../core/scraper/auth/silentLoginLimiter';
import {
  confirmLoginContextSelection,
  fetchLoginContextSelection,
  tryAutoApplyRememberedLoginContext,
} from '../core/scraper/auth/contextSelection';
import type { LoginContextOption } from '../core/scraper/auth/contextSelection.parser';
import { confirmWdSessionAfterLogin } from '../core/scraper/auth/sessionValidation';
import LoginContextSelectionView from '../features/login/LoginContextSelectionView';
import {
  getLoginErrorMessage,
  getLoginResultErrorMessage,
  REQUIRED_FIELD_MESSAGE,
} from '../features/login/loginErrorDisplay';
import {
  LOGIN_LOGO_SIZE,
  loginScreenStyles as styles,
} from '../features/login/LoginScreen.styles';
import { logoLogin } from '../assets/brandLogos';
import AppLogo from '../components/AppLogo';

export default function LoginScreen() {
  const authService = useMemo(() => new AuthService(), []);
  const { enableRememberMe, disableRememberMe, markAuthenticated } =
    useAuthSession();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const didTryContextResume = useRef(false);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const captchaRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameFieldError, setUsernameFieldError] = useState('');
  const [passwordFieldError, setPasswordFieldError] = useState('');
  const [formError, setFormError] = useState('');

  const [captchaContinuationHtml, setCaptchaContinuationHtml] = useState<
    string | null
  >(null);
  const [captchaImageUrl, setCaptchaImageUrl] = useState<string | null>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaBuster, setCaptchaBuster] = useState(0);

  const [loginStep, setLoginStep] = useState<'credentials' | 'context'>(
    'credentials'
  );
  const [contextOptions, setContextOptions] = useState<LoginContextOption[]>(
    []
  );
  const [contextError, setContextError] = useState('');
  const [rememberMeForContext, setRememberMeForContext] = useState(false);

  const captchaVisible = captchaContinuationHtml !== null;
  const contextStepVisible = loginStep === 'context';

  useLoginStoredCredentials({ setUsername, setPassword, setRememberMe });

  useEffect(() => {
    if (loginStep !== 'credentials' || didTryContextResume.current) {
      return;
    }

    didTryContextResume.current = true;
    let cancelled = false;

    (async () => {
      try {
        const page = await fetchLoginContextSelection();
        if (cancelled || page.status !== 'required') {
          return;
        }

        const auto = await tryAutoApplyRememberedLoginContext(page.options);
        if (cancelled) {
          return;
        }
        if (auto.applied) {
          setRememberMeForContext(true);
          const sessionOk = await confirmWdSessionAfterLogin();
          if (cancelled) {
            return;
          }
          if (sessionOk) {
            resetContextStep();
            markAuthenticated({ ephemeral: false });
          }
          return;
        }

        setContextOptions(page.options);
        setLoginStep('context');
        setContextError('');
      } catch {
        /* brak sesji — zostaje formularz logowania */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loginStep]);

  useEffect(() => {
    if (!captchaVisible) {
      return;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [captchaVisible, captchaImageUrl]);

  const clearFieldErrors = useCallback(() => {
    setUsernameFieldError('');
    setPasswordFieldError('');
  }, []);

  const clearFormError = useCallback(() => {
    setFormError('');
  }, []);

  const clearAllErrors = useCallback(() => {
    clearFieldErrors();
    clearFormError();
  }, [clearFieldErrors, clearFormError]);

  const setServerError = useCallback((code: LoginErrorCode) => {
    setFormError(getLoginErrorMessage(code));
  }, []);

  const resetCaptchaUi = useCallback(() => {
    setCaptchaContinuationHtml(null);
    setCaptchaImageUrl(null);
    setCaptchaCode('');
    setCaptchaBuster(0);
  }, []);

  const resetContextStep = useCallback(() => {
    setLoginStep('credentials');
    setContextOptions([]);
    setContextError('');
    setRememberMeForContext(false);
    didTryContextResume.current = true;
  }, []);

  const finishAuthenticatedSession = useCallback(
    async (
      ephemeral: boolean,
      options?: { fromContextStep?: boolean }
    ) => {
      const sessionReady = await confirmWdSessionAfterLogin();
      devLog(
        'LoginScreen',
        sessionReady ? 'session confirmed' : 'session not confirmed'
      );
      if (!sessionReady) {
        const message =
          'Zalogowano, ale portal nie potwierdził sesji. Spróbuj ponownie za chwilę.';
        if (options?.fromContextStep) {
          setContextError(message);
        } else {
          setFormError(message);
        }
        return false;
      }

      setPassword('');
      resetContextStep();
      markAuthenticated({ ephemeral });
      return true;
    },
    [markAuthenticated, resetContextStep]
  );

  const handleContextSelect = useCallback(
    async (option: LoginContextOption) => {
      if (loading) {
        return;
      }

      Keyboard.dismiss();
      setContextError('');

      try {
        setLoading(true);
        const outcome = await confirmLoginContextSelection(option);
        if (!outcome.ok) {
          setContextError(outcome.error);
          return;
        }

        if (rememberMeForContext) {
          const loginUsername = username.trim();
          if (loginUsername) {
            await saveLastLoginContext(loginUsername, option);
          }
        }

        await finishAuthenticatedSession(!rememberMeForContext, {
          fromContextStep: true,
        });
      } catch (err: unknown) {
        setContextError(
          err instanceof Error
            ? err.message
            : 'Nie udało się wybrać kontekstu. Spróbuj ponownie.'
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, rememberMeForContext, finishAuthenticatedSession, username]
  );

  const handleLogin = useCallback(async () => {
    if (loading) {
      return;
    }

    Keyboard.dismiss();
    clearAllErrors();

    const passwordAttempt = password;

    let hasFieldError = false;

    if (!username.trim()) {
      setUsernameFieldError(REQUIRED_FIELD_MESSAGE);
      hasFieldError = true;
    }

    if (!passwordAttempt.trim()) {
      setPasswordFieldError(REQUIRED_FIELD_MESSAGE);
      hasFieldError = true;
    }

    if (hasFieldError) {
      return;
    }

    if (captchaContinuationHtml && !captchaCode.trim()) {
      setFormError('Wpisz kod z obrazka CAPTCHA');
      return;
    }

    try {
      setLoading(true);
      devLog('LoginScreen', 'submit');

      const loginOptions =
        captchaContinuationHtml !== null
          ? {
              continuationHtml: captchaContinuationHtml,
              captcha: captchaCode.trim() || undefined,
            }
          : undefined;

      const result = await authService.login(
        username.trim(),
        passwordAttempt,
        loginOptions
      );

      if (result.requiresCaptcha) {
        if (result.continuationHtml) {
          setCaptchaContinuationHtml(result.continuationHtml);
          setCaptchaImageUrl(result.captchaImageUrl ?? null);
        }
        setCaptchaCode('');
        setFormError(
          result.error ?? 'Wymagana weryfikacja CAPTCHA — wpisz kod z obrazka.'
        );
        return;
      }

      if (!result.success) {
        if (result.errorCode) {
          setServerError(result.errorCode);
        } else {
          setFormError(getLoginResultErrorMessage(result));
        }
        return;
      }

      const loginUsername = username.trim();

      if (rememberMe) {
        await enableRememberMe(loginUsername, passwordAttempt);
      } else {
        await disableRememberMe();
      }

      await saveLastUsername(loginUsername);
      resetSilentLoginLimiter();
      resetCaptchaUi();

      if (result.requiresContextSelection && result.contextOptions?.length) {
        setRememberMeForContext(rememberMe);
        setContextOptions(result.contextOptions);
        setLoginStep('context');
        setContextError('');
        return;
      }

      await finishAuthenticatedSession(!rememberMe);
    } catch (err: unknown) {
      const code = classifyLoginThrowable(err);
      if (code) {
        setServerError(code);
      } else {
        setFormError(
          err instanceof Error ? err.message : 'Błąd podczas logowania'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    username,
    password,
    loading,
    authService,
    markAuthenticated,
    captchaContinuationHtml,
    captchaCode,
    resetCaptchaUi,
    clearAllErrors,
    setServerError,
    rememberMe,
    enableRememberMe,
    disableRememberMe,
    finishAuthenticatedSession,
  ]);

  const focusPassword = useCallback(() => {
    passwordRef.current?.focus();
  }, []);

  const focusCaptchaOrSubmit = useCallback(() => {
    if (captchaVisible) {
      captchaRef.current?.focus();
    } else {
      void handleLogin();
    }
  }, [captchaVisible, handleLogin]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          captchaVisible && styles.scrollContentWithCaptcha,
        ]}
        enableOnAndroid
        extraScrollHeight={80}
        extraHeight={80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableResetScrollToCoords={false}
      >
        {!contextStepVisible && (
          <View style={styles.header}>
            <AppLogo
              size={LOGIN_LOGO_SIZE}
              style={styles.logo}
              source={logoLogin}
              variant="circle"
              resizeMode="contain"
            />
            <Text style={styles.title}>WD-ANS Mobile</Text>
            <Text style={styles.subtitle}>Uczelnia w zasięgu ręki</Text>
            <LoginInfoButton />
          </View>
        )}

        {contextStepVisible ? (
          <LoginContextSelectionView
            options={contextOptions}
            loading={loading}
            error={contextError}
            onSelect={(option) => void handleContextSelect(option)}
            onBack={resetContextStep}
          />
        ) : (
        <View style={styles.form}>
          <LoginIconInput
            ref={usernameRef}
            icon="account-outline"
            placeholder="Login"
            value={username}
            fieldError={usernameFieldError}
            returnKeyType="next"
            onSubmitEditing={focusPassword}
            blurOnSubmit={false}
            onChangeText={(t) => {
              setUsername(t);
              setUsernameFieldError('');
              clearFormError();
              resetCaptchaUi();
            }}
            editable={!loading}
            textContentType="username"
            autoComplete="username"
            importantForAutofill="yes"
          />

          <LoginIconInput
            ref={passwordRef}
            icon="lock-outline"
            placeholder="Hasło"
            value={password}
            fieldError={passwordFieldError}
            returnKeyType={captchaVisible ? 'next' : 'go'}
            onSubmitEditing={focusCaptchaOrSubmit}
            blurOnSubmit={captchaVisible}
            onChangeText={(t) => {
              setPassword(t);
              setPasswordFieldError('');
              clearFormError();
            }}
            secureTextEntry={!passwordVisible}
            rightIcon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            rightIconColor={passwordVisible ? ansColors.gold : ansColors.gray}
            rightIconA11yLabel={
              passwordVisible ? 'Ukryj hasło' : 'Pokaż hasło'
            }
            onRightIconPress={() => setPasswordVisible((value) => !value)}
            rightIconDisabled={loading}
            editable={!loading}
            textContentType="password"
            autoComplete="password"
            importantForAutofill="yes"
          />

          <TouchableOpacity
            style={[styles.rememberRow, loading && styles.rememberRowDisabled]}
            onPress={() => setRememberMe((value) => !value)}
            activeOpacity={0.8}
            disabled={loading}
            accessibilityRole="radio"
            accessibilityState={{ selected: rememberMe, disabled: loading }}
          >
            <View
              style={[
                styles.rememberOuter,
                rememberMe && styles.rememberOuterActive,
              ]}
            >
              {rememberMe && <View style={styles.rememberInner} />}
            </View>
            <Text style={styles.rememberText}>Zapamiętaj mnie</Text>
          </TouchableOpacity>

          {captchaVisible && (
            <LoginCaptchaSection
              imageUrl={captchaImageUrl}
              imageBuster={captchaBuster}
              code={captchaCode}
              loading={loading}
              inputRef={captchaRef}
              onSubmitEditing={() => void handleLogin()}
              onCodeChange={(t) => {
                setCaptchaCode(t);
                clearFormError();
              }}
              onRefreshImage={() => setCaptchaBuster((n) => n + 1)}
            />
          )}

          {!!formError && <Text style={styles.formError}>{formError}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={ansColors.black} />
            ) : (
              <Text style={styles.buttonText}>Zaloguj się</Text>
            )}
          </TouchableOpacity>
        </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
