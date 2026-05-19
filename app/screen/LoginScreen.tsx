import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { isRememberMeEnabled } from '../core/auth/rememberMe.storage';
import {
  getLoginErrorMessage,
  getLoginResultErrorMessage,
  REQUIRED_FIELD_MESSAGE,
} from '../features/login/loginErrorDisplay';
import { loginScreenStyles as styles } from '../features/login/LoginScreen.styles';
import KeyboardDismissView from '../components/KeyboardDismissView';

const ansLogo = require('../../assets/icons/anslogo.png');

export default function LoginScreen() {
  const authService = useMemo(() => new AuthService(), []);
  const { enableRememberMe, disableRememberMe, markAuthenticated } =
    useAuthSession();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
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

  const captchaVisible = captchaContinuationHtml !== null;

  useEffect(() => {
    let cancelled = false;

    void isRememberMeEnabled().then((enabled) => {
      if (!cancelled) {
        setRememberMe(enabled);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleLogin = useCallback(async () => {
    if (loading) {
      return;
    }

    clearAllErrors();

    const passwordAttempt = password;
    setPassword('');

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

      const loginOptions =
        captchaContinuationHtml !== null
          ? {
              continuationHtml: captchaContinuationHtml,
              captcha: captchaCode.trim() || undefined,
            }
          : undefined;

      console.log('[LOGIN SCREEN] START LOGIN', {
        username: username.trim(),
        withCaptcha: Boolean(loginOptions?.continuationHtml),
      });

      const result = await authService.login(
        username.trim(),
        passwordAttempt,
        loginOptions
      );

      console.log('[LOGIN SCREEN] LOGIN RESULT:', {
        success: result.success,
        requiresCaptcha: result.requiresCaptcha,
        errorCode: result.errorCode,
      });

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

      if (rememberMe) {
        await enableRememberMe(username.trim(), passwordAttempt);
      } else {
        await disableRememberMe();
      }

      resetCaptchaUi();
      markAuthenticated();
    } catch (err: unknown) {
      console.log('[LOGIN SCREEN] CATCH ERROR', err);
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
      <KeyboardDismissView>
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
        keyboardShouldPersistTaps="never"
        showsVerticalScrollIndicator={false}
        enableResetScrollToCoords={false}
      >
        <View style={styles.header}>
          <Image source={ansLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>WD-ANS Mobile</Text>
          <Text style={styles.subtitle}>Uczelnia w zasięgu ręki</Text>
          <LoginInfoButton />
        </View>

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
      </KeyboardAwareScrollView>
      </KeyboardDismissView>
    </SafeAreaView>
  );
}
