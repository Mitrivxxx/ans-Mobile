import React, { useCallback, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RefreshableScrollView from '../components/RefreshableScrollView';
import { useAppTheme } from '../context/AppThemeContext';
import { useAuthSession } from '../context/AuthSessionContext';
import { useStudentProfile } from '../context/StudentProfileContext';
import { clearQueryCacheOnly } from '../core/queryClient/clearQueryCacheOnly';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAppUpdates } from '../context/AppUpdatesContext';
import { getAppEnvDisplayName, isProductionApp } from '../config/env';
import { getUpdateErrorAlertMessage } from '../features/settings/updateUserMessages';
import { APP_VERSION } from '../version';

export default function SettingsScreen() {
  const { isDarkMode, colors, toggleDarkMode } = useAppTheme();
  const { refetch } = useStudentProfile();
  const { rememberMeEnabled, disableRememberMe } = useAuthSession();
  const { isOffline } = useNetworkStatus();
  const {
    supported,
    autoCheckEnabled,
    setAutoCheckEnabled,
    checking,
    pendingReload,
    runningUpdateId,
    otaChannel,
    checkForUpdate,
    applyPendingUpdate,
  } = useAppUpdates();
  const [cacheClearing, setCacheClearing] = useState(false);
  const showBuildDiagnostics = !isProductionApp();

  const refreshScreen = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useRegisterScreenRefresh(refreshScreen);

  const handleRememberMeToggle = useCallback(
    async (next: boolean) => {
      if (next) {
        Alert.alert(
          'Zapamiętaj mnie',
          'Aby włączyć automatyczne logowanie, wyloguj się i zaloguj ponownie z zaznaczoną opcją „Zapamiętaj mnie” na ekranie logowania.',
          [{ text: 'OK' }]
        );
        return;
      }

      await disableRememberMe();
    },
    [disableRememberMe]
  );

  const handleClearCache = useCallback(async () => {
    if (cacheClearing) {
      return;
    }

    Alert.alert(
      'Wyczyść cache',
      'Usunie zapisane plany i dane w aplikacji (bez wylogowania). Dane zostaną pobrane ponownie przy odświeżeniu ekranów.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyczyść',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                setCacheClearing(true);
                await clearQueryCacheOnly();
                Alert.alert('Gotowe', 'Cache aplikacji został wyczyszczony.');
              } catch (err) {
                Alert.alert(
                  'Błąd',
                  err instanceof Error ? err.message : 'Nie udało się wyczyścić cache.'
                );
              } finally {
                setCacheClearing(false);
              }
            })();
          },
        },
      ]
    );
  }, [cacheClearing]);

  const handleCheckAppUpdate = useCallback(async () => {
    if (checking) {
      return;
    }

    const result = await checkForUpdate({ userInitiated: true });

    switch (result.status) {
      case 'dev':
        Alert.alert(
          'Aktualizacje',
          'Ta funkcja działa w aplikacji pobranej z pliku APK, a nie w trybie do programowania (Expo Go).'
        );
        break;
      case 'disabled':
        Alert.alert(
          'Aktualizacje',
          'Twoja wersja aplikacji nie obsługuje aktualizacji w tle. Zainstaluj najnowszy plik APK z GitHub.'
        );
        break;
      case 'upToDate':
        Alert.alert(
          'Aktualizacje',
          'Jesteś na bieżąco — nie ma nowych aktualizacji.'
        );
        break;
      case 'downloaded':
        Alert.alert(
          'Aktualizacje',
          'Pobrano nową wersję. Aby ją włączyć, użyj przycisku „Zastosuj pobraną aktualizację” poniżej — aplikacja uruchomi się ponownie.'
        );
        break;
      case 'error':
        Alert.alert(
          'Nie udało się zaktualizować',
          getUpdateErrorAlertMessage(result.message)
        );
        break;
      default:
        break;
    }
  }, [checkForUpdate, checking]);

  const handleAutoUpdatesToggle = useCallback(
    async (next: boolean) => {
      await setAutoCheckEnabled(next);
      if (next && supported && !checking) {
        void checkForUpdate();
      }
    },
    [setAutoCheckEnabled, supported, checking, checkForUpdate]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.dashboardBg }]}
      edges={['left', 'right', 'bottom']}
    >
      <RefreshableScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.charcoal }]}>
          Ustawienia
        </Text>
        <Text style={[styles.subtitle, { color: colors.gray }]}>
          Preferencje aplikacji
        </Text>

        {isOffline ? (
          <View style={[styles.offlineBanner, { borderColor: colors.grayBorder }]}>
            <Text style={[styles.offlineText, { color: colors.error }]}>
              Brak połączenia z internetem. Część danych może być nieaktualna.
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.grayBorder,
            },
          ]}
        >
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: colors.charcoal }]}>
              Tryb ciemny
            </Text>
            <Text style={[styles.cardDescription, { color: colors.gray }]}>
              Zmień wygląd aplikacji na ciemny motyw.
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{
              false: colors.switchTrackOff,
              true: colors.switchTrackOn,
            }}
            thumbColor={colors.switchThumb}
            ios_backgroundColor={colors.switchTrackOff}
          />
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.grayBorder,
            },
          ]}
        >
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: colors.charcoal }]}>
              Zapamiętaj mnie
            </Text>
            <Text style={[styles.cardDescription, { color: colors.gray }]}>
              {rememberMeEnabled
                ? 'Włączone — aplikacja może logować się automatycznie.'
                : 'Wyłączone — wymagane logowanie przy każdej sesji.'}
            </Text>
          </View>
          <Switch
            value={rememberMeEnabled}
            onValueChange={(value) => void handleRememberMeToggle(value)}
            trackColor={{
              false: colors.switchTrackOff,
              true: colors.switchTrackOn,
            }}
            thumbColor={colors.switchThumb}
            ios_backgroundColor={colors.switchTrackOff}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.grayBorder,
              opacity: cacheClearing ? 0.6 : 1,
            },
          ]}
          onPress={() => void handleClearCache()}
          disabled={cacheClearing}
          activeOpacity={0.85}
        >
          <Text style={[styles.cardTitle, { color: colors.charcoal }]}>
            Wyczyść cache aplikacji
          </Text>
          <Text style={[styles.cardDescription, { color: colors.gray }]}>
            Usuwa zapisany plan i dane w pamięci (bez wylogowania).
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.updatesSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.grayBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.charcoal }]}>
            Aktualizacje aplikacji
          </Text>
          <Text style={[styles.cardDescription, { color: colors.gray }]}>
            {supported
              ? 'Możesz pobrać nowe poprawki bez ponownej instalacji z GitHub. Przy pierwszym uruchomieniu sprawdzanie w tle jest wyłączone — włącz je poniżej, jeśli chcesz.'
              : 'Dostępne po zainstalowaniu aplikacji z pliku APK (nie w trybie programisty).'}
          </Text>

          <View
            style={[
              styles.card,
              styles.updatesRow,
              { borderColor: colors.grayBorder, backgroundColor: colors.dashboardBg },
            ]}
          >
            <View style={styles.textBlock}>
              <Text style={[styles.cardTitle, { color: colors.charcoal }]}>
                Sprawdzaj automatycznie
              </Text>
              <Text style={[styles.cardDescription, { color: colors.gray }]}>
                Aplikacja sama poszuka aktualizacji po włączeniu i po powrocie do programu.
              </Text>
            </View>
            <Switch
              value={autoCheckEnabled}
              onValueChange={(value) => void handleAutoUpdatesToggle(value)}
              disabled={!supported}
              trackColor={{
                false: colors.switchTrackOff,
                true: colors.switchTrackOn,
              }}
              thumbColor={colors.switchThumb}
              ios_backgroundColor={colors.switchTrackOff}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.updatesButton,
              {
                backgroundColor: colors.gold,
                opacity: !supported || checking || isOffline ? 0.55 : 1,
              },
            ]}
            onPress={() => void handleCheckAppUpdate()}
            disabled={!supported || checking || isOffline}
            activeOpacity={0.85}
          >
            <Text style={[styles.updatesButtonText, { color: colors.black }]}>
              {checking ? 'Sprawdzanie…' : 'Sprawdź teraz'}
            </Text>
          </TouchableOpacity>

          {supported && pendingReload && !checking ? (
            <TouchableOpacity
              style={[
                styles.updatesButtonOutline,
                { borderColor: colors.grayBorder },
              ]}
              onPress={() => void applyPendingUpdate()}
              activeOpacity={0.85}
            >
              <Text style={[styles.updatesButtonOutlineText, { color: colors.charcoal }]}>
                Zastosuj pobraną aktualizację
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[styles.version, { color: colors.gray }]}>
          Wersja {APP_VERSION}
          {showBuildDiagnostics ? (
            <>
              {'\n'}
              Środowisko: {getAppEnvDisplayName()}
              {otaChannel ? `\nKanał OTA: ${otaChannel}` : ''}
              {runningUpdateId
                ? `\nPakiet OTA: ${runningUpdateId.slice(0, 8)}…`
                : ''}
            </>
          ) : null}
        </Text>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  offlineBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 4,
  },
  updatesSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  updatesRow: {
    marginTop: 0,
  },
  updatesButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  updatesButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  updatesButtonOutline: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  updatesButtonOutlineText: {
    fontSize: 14,
    fontWeight: '700',
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  version: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
