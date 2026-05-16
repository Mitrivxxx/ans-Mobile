import React, { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCookies } from '../core/scraper/client';
import { WdAuthService } from '../core/scraper/auth/wdLogin';

function captchaUriWithBuster(url: string, buster: number): string {
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_cb=${buster}`;
}

export default function LoginScreen({
  navigation,
}: any) {
  const authService = useMemo(() => new WdAuthService(), []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearingCookies, setClearingCookies] = useState(false);
  const [error, setError] = useState('');

  const [captchaContinuationHtml, setCaptchaContinuationHtml] = useState<
    string | null
  >(null);
  const [captchaImageUrl, setCaptchaImageUrl] = useState<string | null>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaBuster, setCaptchaBuster] = useState(0);

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

    if (!username.trim()) {
      setError('Wpisz login');
      return;
    }

    if (!password.trim()) {
      setError('Wpisz hasło');
      return;
    }

    if (captchaContinuationHtml && !captchaCode.trim()) {
      setError('Wpisz kod z obrazka CAPTCHA');
      return;
    }

    try {
      setLoading(true);
      setError('');

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
        password,
        loginOptions
      );

      console.log('[LOGIN SCREEN] LOGIN RESULT:', {
        success: result.success,
        requiresCaptcha: result.requiresCaptcha,
      });

      if (result.requiresCaptcha) {
        if (result.continuationHtml) {
          setCaptchaContinuationHtml(result.continuationHtml);
          setCaptchaImageUrl(result.captchaImageUrl ?? null);
        }
        setCaptchaCode('');
        setError(result.error ?? 'Wymagana weryfikacja CAPTCHA');
        return;
      }

      if (!result.success) {
        setError(result.error ?? 'Nie udało się zalogować — sprawdź login i hasło');
        return;
      }

      resetCaptchaUi();
      console.log('[LOGIN SCREEN] NAVIGATING TO DASHBOARD');
      navigation.replace('Dashboard');
    } catch (err: any) {
      console.log('[LOGIN SCREEN] CATCH ERROR', err);
      setError(err?.message ?? 'Błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  }, [
    username,
    password,
    loading,
    authService,
    navigation,
    captchaContinuationHtml,
    captchaCode,
    resetCaptchaUi,
  ]);

  const handleClearAllCookies = useCallback(async () => {
    if (loading || clearingCookies) {
      return;
    }

    try {
      setClearingCookies(true);
      setError('');
      await authService.clearAllCookies();
      resetCaptchaUi();
      Alert.alert(
        'Cookies',
        'Usunięto wszystkie cookies (przeglądarka w aplikacji oraz zapamiętana sesja axios).',
      );
    } catch (err: any) {
      setError(err?.message ?? 'Nie udało się usunąć cookies');
    } finally {
      setClearingCookies(false);
    }
  }, [authService, loading, clearingCookies, resetCaptchaUi]);

  const cookieHeader = getCookies();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>WD Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Login"
            placeholderTextColor="#999"
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              resetCaptchaUi();
            }}
            editable={!loading && !clearingCookies}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
          />

          <TextInput
            style={styles.input}
            placeholder="Hasło"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading && !clearingCookies}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {captchaContinuationHtml !== null && (
            <View style={styles.captchaBlock}>
              <Text style={styles.captchaLabel}>CAPTCHA</Text>
              {captchaImageUrl ? (
                <Image
                  style={styles.captchaImage}
                  source={{
                    uri: captchaUriWithBuster(captchaImageUrl, captchaBuster),
                    headers: cookieHeader
                      ? { Cookie: cookieHeader }
                      : undefined,
                  }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.captchaFallback}>
                  Brak adresu obrazka — użyj „Odśwież CAPTCHA” po zalogowaniu sesji.
                </Text>
              )}
              <TouchableOpacity
                style={styles.captchaRefresh}
                onPress={() => setCaptchaBuster((n) => n + 1)}
                disabled={loading || clearingCookies}
              >
                <Text style={styles.captchaRefreshText}>Odśwież CAPTCHA</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Kod z obrazka (max 5 znaków)"
                placeholderTextColor="#999"
                value={captchaCode}
                onChangeText={setCaptchaCode}
                maxLength={5}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading && !clearingCookies}
              />
            </View>
          )}

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading || clearingCookies}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>Zaloguj</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.clearCookiesButton,
              (loading || clearingCookies) && styles.buttonDisabled,
            ]}
            onPress={handleClearAllCookies}
            activeOpacity={0.8}
            disabled={loading || clearingCookies}
          >
            {clearingCookies ? (
              <ActivityIndicator color="#555" />
            ) : (
              <Text style={styles.clearCookiesButtonText}>
                Usuń wszystkie cookies
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
    color: '#111',
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#111',
  },
  captchaBlock: {
    marginBottom: 8,
  },
  captchaLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  captchaImage: {
    width: 200,
    height: 70,
    alignSelf: 'center',
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  captchaFallback: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  captchaRefresh: {
    alignSelf: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  captchaRefreshText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    height: 56,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  clearCookiesButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  clearCookiesButtonText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
});
