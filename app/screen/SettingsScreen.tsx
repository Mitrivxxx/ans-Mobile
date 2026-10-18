import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
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
import { useDataRefreshInterval } from '../context/DataRefreshIntervalContext';
import { useStudentProfile } from '../context/StudentProfileContext';
import { clearQueryCacheOnly } from '../core/queryClient/clearQueryCacheOnly';
import { useQueryUserKey } from '../core/queryClient/useQueryUserKey';
import { clearProfilePhotoSessionCache } from '../core/scraper/features/profile/profilePhotoSessionCache';
import { clearProfilePhotoForUser } from '../core/scraper/features/profile/profileSummaryPhoto';
import { useRegisterScreenRefresh } from '../hooks/useRegisterScreenRefresh';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { APP_VERSION } from '../version';

function profileRefetchFailed(result: unknown): boolean {
  return (
    typeof result === 'object' &&
    result !== null &&
    'isSuccess' in result &&
    (result as { isSuccess: boolean }).isSuccess === false
  );
}

export default function SettingsScreen() {
  const { isDarkMode, colors, toggleDarkMode } = useAppTheme();
  const { refetch } = useStudentProfile();
  const userKey = useQueryUserKey();
  const { rememberMeEnabled, disableRememberMe } = useAuthSession();
  const { isOffline } = useNetworkStatus();
  const {
    selectedOption: selectedRefreshOption,
    options: refreshIntervalOptions,
    setIntervalMs,
  } = useDataRefreshInterval();
  const [cacheClearing, setCacheClearing] = useState(false);
  const [refreshDropdownOpen, setRefreshDropdownOpen] = useState(false);

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
      'Usunie zapisane plany i dane w aplikacji (bez wylogowania). Dane ekranów zostaną pobrane ponownie przy odświeżeniu. Zdjęcie profilowe zostanie pobrane od razu.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyczyść',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              let cacheCleared = false;
              try {
                setCacheClearing(true);
                await clearQueryCacheOnly();
                clearProfilePhotoSessionCache();
                await clearProfilePhotoForUser(userKey);
                cacheCleared = true;

                const result = await refetch();
                if (profileRefetchFailed(result)) {
                  Alert.alert(
                    'Cache wyczyszczony',
                    'Zapisane dane zostały usunięte, ale nie udało się pobrać zdjęcia profilowego. Odśwież ekran, gdy będzie połączenie z internetem.'
                  );
                  return;
                }

                const photoScraped =
                  typeof result === 'object' &&
                  result !== null &&
                  'isSuccess' in result &&
                  (result as { isSuccess: boolean }).isSuccess === true;

                Alert.alert(
                  'Gotowe',
                  photoScraped
                    ? 'Cache aplikacji został wyczyszczony. Zdjęcie profilowe zostało pobrane ponownie.'
                    : 'Cache aplikacji został wyczyszczony.'
                );
              } catch (err) {
                const detail =
                  err instanceof Error ? err.message : 'Nie udało się wyczyścić cache.';
                Alert.alert(
                  cacheCleared ? 'Cache wyczyszczony' : 'Błąd',
                  cacheCleared
                    ? `Zapisane dane zostały usunięte, ale nie udało się pobrać zdjęcia profilowego. ${detail}`
                    : detail
                );
              } finally {
                setCacheClearing(false);
              }
            })();
          },
        },
      ]
    );
  }, [cacheClearing, refetch, userKey]);

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
            styles.settingsBlock,
            {
              backgroundColor: colors.surface,
              borderColor: colors.grayBorder,
            },
          ]}
        >
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: colors.charcoal }]}>
              Odświeżanie danych
            </Text>
            <Text style={[styles.cardDescription, { color: colors.gray }]}>
              Jak często aplikacja pobiera nowe dane z portalu WD w tle.
            </Text>
          </View>
          <View style={styles.dropdownWrap}>
            <Pressable
              onPress={() => setRefreshDropdownOpen((open) => !open)}
              style={[
                styles.dropdownButton,
                { borderColor: colors.grayBorder, backgroundColor: colors.dashboardBg },
              ]}
              accessibilityRole="button"
              accessibilityState={{ expanded: refreshDropdownOpen }}
              accessibilityLabel="Wybierz interwał odświeżania danych"
            >
              <Text style={[styles.dropdownButtonText, { color: colors.charcoal }]}>
                {selectedRefreshOption.label}
              </Text>
              <Text style={[styles.dropdownChevron, { color: colors.gray }]}>
                {refreshDropdownOpen ? '▲' : '▼'}
              </Text>
            </Pressable>
            {refreshDropdownOpen ? (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    borderColor: colors.grayBorder,
                    backgroundColor: colors.surfaceRaised,
                  },
                ]}
              >
                {refreshIntervalOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setRefreshDropdownOpen(false);
                      void setIntervalMs(option.ms);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && { backgroundColor: colors.dashboardBg },
                    ]}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.charcoal },
                        option.id === selectedRefreshOption.id &&
                          styles.dropdownItemTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
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

        <Text style={[styles.version, { color: colors.gray }]}>
          Wersja {APP_VERSION}
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
  settingsBlock: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
  },
  dropdownWrap: {
    position: 'relative',
    zIndex: 2,
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  dropdownChevron: {
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    fontWeight: '800',
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 4,
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
