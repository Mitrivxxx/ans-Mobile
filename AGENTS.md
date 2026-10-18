# WDMobile — przewodnik dla agenta AI

Mobilna aplikacja (Expo / React Native) dla studentów **Wyższej Szkoły Nauk** — dane pobierane ze scrapera portalu **WD** (`https://wd.ans-ns.edu.pl`), nie z oficjalnego API.

Ten plik opisuje architekturę, konwencje i miejsca, w których szukać informacji przy debugowaniu i dodawaniu funkcji.

---

## Stack

| Warstwa | Technologia |
|---------|-------------|
| UI | React 19, React Native 0.81, Expo ~54 |
| Nawigacja | `@react-navigation/stack` (stack, bez tabów) |
| HTTP | Axios + własny store ciasteczek |
| HTML | `linkedom` (`parseHTML`) |
| Cache / sync | TanStack Query v5 + persystencja AsyncStorage |
| Sekrety | `react-native-keychain` (zapamiętaj mnie), cookies natywne |

Wejście: `index.ts` → `App.tsx`.

---

## Struktura katalogów

```
app/
  screen/              # Ekrany (thin) — podłączają feature components
  features/<name>/     # UI + hooks specyficzne dla domeny (grades, plan, dashboard…)
  components/          # Współdzielone (AppHeader, sidebar, profile views)
  context/             # AuthSession, AppTheme, StudentProfile, ScreenRefresh, Sidebar
  hooks/               # Ogólne (network, prefetch, profile photo)
  navigation/          # navigationRef, typy tras
  theme/               # ansTheme, useThemedStyles
  core/
    auth/              # performSignOut, rememberMe, sessionUser
    queryClient/       # queryKeys, persystencja, useUserPersistentQuery
    scraper/           # cała logika WD (patrz niżej)
    network/           # reconnect
    preferences/       # dark mode storage
assets/                # ikony, logo
info.txt               # komendy dev (adb, expo)
app/version.ts         # APP_VERSION — sync z package.json i app.json
```

**Zasada warstw:** `screen` → `features/*/components` + `features/*/hooks` → `core/scraper` + `core/queryClient`. Nie importuj scrapera bezpośrednio z głębokich komponentów UI — przez hook lub service singleton w hooku.

---

## Jedna aplikacja produkcyjna

Jest jeden pakiet: **WDMobile**, `pl.matsma.WDMobile` (Android i iOS). Nazwa nie zależy od `APP_ENV` ani `EAS_BUILD_PROFILE`.

`react-native.config.js` ma na sztywno `packageName`. Gradle trzyma wynik autolinkingu w cache i odświeża go dopiero, gdy zmieni się ten plik (albo `package.json` / lockfile). Poprzednie warstwy `.dev` i `.demo` zostawiały w tym cache obcy pakiet i release się nie kompilował.

| Akcja | Komenda |
|-------|---------|
| Metro (dev na telefonie/emulatorze) | `npx expo start` |
| Lokalny APK release | `npm run build:apk:local` |
| EAS Android (AAB, Sklep Play) | `npm run build:production:android` |
| EAS iOS | `npm run build:production:ios` |

`npx expo start` to ten sam pakiet, tylko z bundlerem Metro (`__DEV__`). Logi deweloperskie są włączone wyłącznie przy `__DEV__`.

Profil `ios-simulator` w `eas.json` dziedziczy po `production` i nie zmienia pakietu. Sekrety (`EXPO_TOKEN`, keystore) trzymaj poza repo (`.env` w `.gitignore`). Każda zmiana natywna wymaga nowego buildu — projekt nie używa EAS Update / OTA.

---

## Przepływ aplikacji (bootstrap)

```mermaid
flowchart TD
  A[AppRoot: dark mode + remember me?] --> B[App.tsx]
  B --> C[AppInitGate: initClient + setupScraperAuthGuard]
  C --> D[PersistQueryClientProvider]
  D --> E[AuthSessionProvider]
  E --> F{authStatus}
  F -->|unknown| G[Pusty ekran — krótko, bez remember me]
  F -->|restoring| I[Dashboard + AuthSyncBanner Logowanie...]
  F -->|unauthenticated| H[Login stack]
  F -->|authenticated| I[AppHeader + MainNavigator + Sidebar]
  I --> J[usePrefetchUserScraperData]
```

1. **`AppRoot`** — równoległy odczyt dark mode + `rememberMeBootstrap`; chowa natywny splash, przekazuje `initialRememberMeRestore`.
2. **`AppInitGate`** — `initClient()` (cookies), `setupScraperAuthGuard()` (interceptory axios).
3. **`AuthSessionProvider`** — przy remember me: od razu `authStatus=restoring` (dashboard + cache), silent login w tle; po `persistReady` uzupełnia komunikat degraded z cache.
4. **Authenticated shell** (`authenticated` lub `restoring`) — `StudentProfileProvider`, `SidebarProvider`, `ScreenRefreshProvider`, `AuthSyncBanner`.

---

## Scraper (najważniejsza warstwa)

### Klient HTTP

- `app/core/scraper/client/client.ts` — axios, `baseURL: WD_BASE_URL`
- `app/core/scraper/client/cookieStore.ts` — jar ciasteczek (CookieManager + migracja z AsyncStorage)
- Każdy request (oprócz `/Logowanie`) przechodzi przez **`ensureAuthenticatedBeforeScrape`** (interceptor w `ensureAuthenticated.ts`)

### Autentykacja

| Plik | Rola |
|------|------|
| `auth/auth.service.ts` | Logowanie, captcha, POST do WD |
| `auth/contextSelection.ts` | Po logowaniu: `/WyborKontekstu` → lista opcji; wybór na `LoginScreen`; przy „zapamiętaj mnie” ostatni kontekst w `lastLoginContext.storage.ts` (auto przy silent login / probe) |
| `auth/userConsent.ts` | Ciasteczko `.user-consent` (wymagane przy wyborze kontekstu) |
| `auth/ensureAuthenticated.ts` | Guard requestów, silent login, retry po wygaśnięciu sesji |
| `auth/sessionValidation.ts` | `assertAuthenticatedHtml`, probe sesji, `SessionExpiredError` |
| `auth/session.store.ts` / `sessionLifetime.ts` | Flagi sesji, TTL |
| `core/auth/rememberMe.storage.ts`, `SecureStorageService.ts` | Zapamiętaj mnie (Keychain / Keystore) |
| `core/auth/performSignOut.ts` | Logout + czyszczenie cache i zdjęcia profilu |

**Remember me:** cold start → dashboard od razu (`authStatus=restoring`, baner „Logowanie…”), silent login w tle; przy wygaśnięciu sesji ponowna próba; offline / brak sieci → **tryb offline** (panel główny + `sessionDegraded`, bez wymogu cache). Polityka: `authSessionPolicy.ts`. Bootstrap: `rememberMeBootstrap.ts`.

**Bez remember me:** ciasteczka WD przy **cold start** są czyszczone (`ephemeralSession.ts`); użytkownik trafia na ekran logowania — **bez** trybu offline z cache po restarcie aplikacji.

**Degraded mode:** tylko przy włączonym remember me — brak żywej sesji WD, wyświetlane dane z cache (`sessionDegraded`, `AuthSyncBanner`).

### Wzorzec feature scrapera

Każda domena w `app/core/scraper/features/<feature>/`:

```
*.fetch.ts    # GET/POST przez client (surowy HTML lub DX)
*.parse.ts    # linkedom → typowane obiekty; assertAuthenticatedHtml(html)
*.types.ts    # Typy domenowe
*.service.ts  # Klasa publiczna (getX → parse/fetch)
```

Opcjonalnie: `*.grid.ts`, `*.page.ts`, `merge*.ts` (np. oceny).

**DX (DevExpress callback):** odpowiedzi AJAX portalu — `app/core/scraper/parsers/dx.parser.ts` (`parseDxResponse` → `html`).

**Nowy endpoint WD:** zacznij od `fetch` (URL z istniejącego feature lub DevTools), potem `parse` + typy, na końcu `Service` i hook.

### Istniejące feature scrapera

| Folder | Opis |
|--------|------|
| `plan/` | Plan zajęć studenta (lekcje, tydzień) |
| `grades/` | Indeks ocen, semestry, partial (pojedynczy przedmiot) |
| `announcements/` | Lista + szczegóły ogłoszeń |
| `profile/` | Profil studenta, avatar/zdjęcie (`profile.avatar.ts`, `profilePhotoSessionCache.ts`) |
| `lecturers/` | Wyszukiwanie wykładowców + plan wykładowcy (**bez React Query cache**) |

---

## React Query i cache

### Klucze

`app/core/queryClient/queryKeys.ts` — wszystkie klucze **muszą** zawierać `userKey` (z `useQueryUserKey`: username z remember me lub `getLastUsername()`).

### Hooki danych

- **`useUserPersistentQuery`** — główny wzorzec: cache do ręcznej zamiany (`cacheUntilReplace`), auto-sync co 12h (`persistentAutoSync.ts`), sync na focus/mount gdy minął interwał, `syncStatus`, `forceRefresh` resetuje timer (udany fetch → `dataUpdatedAt`).
- **`useQuery`** (cache sesji, `gcTime` ~1h) — `usePartialGradesQuery`, `useAnnouncementDetailsQuery` (nie trafiają na dysk).
- **`createPersistentQueryHook`** — starszy wariant fabryki hooków (sprawdź, czy feature już go używa).

### Co jest persystowane na dysk (offline bundle)

`shouldPersistQuery.ts` — **whitelist** (nie cały root): `studentPlan.lessons` (plan semestru — sidebar Plan), `weekLessons` — 5 tygodni wokół bieżącego (2 wstecz, bieżący, 2 do przodu — `planWeekWindow.ts`), `grades.index`, `grades.semester`, `announcements.list`, `profile.summary` (bez base64) + `profile.details`. **Bez:** `partial`, `detail`, tygodnie planu poza oknem prefetch.

- `maxAge`: `PERSIST_MAX_AGE_MS` (~90 dni) — stary blob AsyncStorage wygasa przy restore.
- `buster`: `PERSIST_QUERY_BUSTER` (`v2-offline-bundle`) — migracja starego przepełnionego cache.
- Przy zapisie: tygodnie planu poza 5-tygodniowym oknem są obcinane (`persistClientTransform.ts`).
- Awatar: `profilePhotoSessionCache` (RAM) + `profilePhotoPersist.storage.ts` (AsyncStorage); nie w blobie React Query (`profileSummaryPhoto.ts`, `persistClientTransform.ts`).

Profil: prefetch summary po logowaniu; ekran Profil (`profile.details`) — `syncOnMount: false`; auto-scrape co 12h przy focusie lub pull-to-refresh.

### Prefetch po logowaniu

`prefetchUserScraperData.ts` — po logowaniu: `profile.summary`. Plan tygodniowy (5 tygodni): `prefetchStudentPlanWeeks.ts` + `usePrefetchPlanWeekWindow` na panelu harmonogramu dashboardu; tygodnie poza oknem — lazy przy nawigacji (`useStudentPlanWeekLessons`, bez zapisu na dysk).

Dashboard i ekrany sidebar (Ogłoszenia, Oceny, Plan, profil): `useUserPersistentQuery` + `persistentAutoSync.ts` — **auto-sync co 12h** od ostatniego udanego fetcha (`dataUpdatedAt`); ręczny pull-to-refresh (`forceRefresh`) resetuje licznik dla danego zapytania. `syncOnMount` na panelach dashboardu — przy wejściu sync tylko gdy brak cache lub minęło 12h. Opłaty (`useStudentFeesQuery`) — ten sam interwał, bez zapisu na dysk.

### Czyszczenie

`clearUserAppCache.ts` — przy wylogowaniu; invaliduje query per user.

---

## UI i nawigacja

### Trasy (`RootParamList`)

`Login` | `Dashboard` | `Plan` | `Grades` | `Announcements` | `Profile` | `FindLecturer` | `LecturerPlan` (params) | `Settings`

Nawigacja imperatywna: `navigationRef.ts` (`navigateTo`, `navigateToLecturerPlan`, `replaceTo`).

Sidebar: `AppSidebar` + `SidebarContext` — trasy bez `LecturerPlan` i `Login`.

### Motyw

- `AppThemeContext` + `ansTheme.ts` (`lightAnsColors` / `darkAnsColors`)
- Style: `useThemedStyles(createXStyles)` — factory `(colors: AnsColors) => StyleSheet`
- Pliki `*.styles.ts` obok komponentów
- **Tokeny według roli, nie wyglądu.** `charcoal` = tekst główny (w ciemnym motywie jasny), `surface` = tło karty, `black` się nie odwraca. Nie używaj ich jako „tekst na kolorze” ani tła przycisku — do tego są: `onAccent` (tekst na nasyconym akcencie), `today*` (dzień „dziś” / wybrany w kalendarzu), `retryButton*`, `primaryButton*`, `gradesSummary*`, `errorBorder`, `successText`, `attachmentAccent`, `surfaceRaised` (menu boczne, rozwijane listy — w ciemnym motywie hierarchia przez jasność, nie cień), `backdrop`, `menuDashboardAccent` / `menuSettingsAccent`.
- **Kolory funkcji:** jedno źródło `app/theme/featureAccents.ts` (sidebar, kafelki, szybkie akcje, banery sync). Nie wpisuj hexów akcentów w komponentach.
- **Paleta ocen:** `features/grades/gradesTheme.ts` (`useGradesColors`) — akcent morski jak `featureAccents.grades`.
- **Typy zajęć:** `lessonTypeTheme.ts` — `resolveLessonTypeStyle(type, groups, isDarkMode)` (ciemne warianty w `darkLessonTypeColors`).
- **Wydarzenia:** kolory wydziałów w ciemnym motywie przyciemniane przez `resolveDepartmentPanelColor` (`features/dashboard/eventsPanelColor.ts`).
- Helpery: `app/theme/colorUtils.ts` (`darkenHex`, `withAlpha`, `contrastRatio`). Test `__tests__/theme/darkThemeContrast.test.ts` pilnuje WCAG AA dla kluczowych par ciemnego motywu — przy zmianie palety uruchom `npm test`.

### Odświeżanie ekranów

`ScreenRefreshContext` + `RefreshableScrollView` — pull-to-refresh powiązany z refetch hooków na danym ekranie.

---

## Konteksty (kiedy używać)

| Context | Zastosowanie |
|---------|----------------|
| `AuthSessionContext` | `authStatus`, signOut, remember me, degraded |
| `StudentProfileContext` | Zdenormalizowany profil w headerze/sidebarze (oparty o `useStudentProfileQuery`) |
| `AppThemeContext` | `colors`, `isDarkMode` |
| `SidebarContext` | Otwarcie/zamknięcie menu |
| `ScreenRefreshContext` | Globalny refresh trigger |

---

## Checklist: nowa funkcja użytkowa

1. **Czy dane są na WD?** Ustal URL i format (HTML vs DX). Skopiuj wzorzec z najbliższego `features/*` w scraperze.
2. **Service + typy** w `core/scraper/features/<nazwa>/`.
3. **Hook** w `app/features/<nazwa>/hooks/`:
   - cache użytkownika → `useUserPersistentQuery` + wpis w `queryKeys.ts`
   - jednorazowe → `useQuery` + `useQueryUserKey`
4. **Persystencja?** Jeśli tak — dodaj root key do `shouldPersistQuery` i `queryKeys` (świadoma decyzja).
5. **Ekran** w `app/screen/` + komponenty w `app/features/<nazwa>/`.
6. **Trasa** — `navigationRef.ts`, `App.tsx` (`AppStack.Screen`), sidebar (`useSidebarActions` / menu).
7. **Prefetch** — opcjonalnie rozszerz `prefetchUserScraperData.ts`.
8. **Wersja** — przy release: `app/version.ts`, `package.json`, `app.json` (komentarz w `version.ts`).

### Feature bez cache (wzór: wykładowcy)

`FindLecturerScreen` — lokalny `useState`, bezpośrednio `new LecturersService()` w `useMemo`, fetch przy akcji użytkownika. Plan wykładowcy: `LecturerPlanScreen` + `lecturer-plan.service.ts`.

---

## Mapa „gdzie szukać”

| Pytanie | Gdzie |
|---------|--------|
| Jak dodać ekran? | `App.tsx`, `navigationRef.ts`, `app/screen/` |
| Jak pobrać oceny/plan? | `features/grades/hooks/*`, `features/plan/hooks/*` |
| Błąd logowania / captcha | `features/login/`, `auth/login.parser.ts`, `login.errors.ts` |
| Zapis loginu / autofill | `SecureStorageService.ts`, `useLoginStoredCredentials`, `LoginScreen.tsx` |
| Wybór kontekstu po logowaniu (inne wydziały) | `auth/contextSelection.ts`, `auth/contextSelection.parser.ts` |
| Sesja wygasła | `ensureAuthenticated.ts`, `AuthSessionContext`, `AuthSyncBanner` |
| Zdjęcie profilu | `profilePhotoSessionCache.ts`, `profileSummaryPhoto.ts`, `useProfilePhoto.ts`, `profile.avatar.ts` |
| Dashboard kafelki | `features/dashboard/dashboard.features.ts`, panele `Dashboard*Panel` |
| Test równoległych requestów | `core/utils/mapWithConcurrency.ts` |
| Ciemny motyw | `preferences/darkMode.storage.ts`, `SettingsScreen` |
| Package / build | `eas.json`, `app.config.ts`, `react-native.config.js` — sekcja **Jedna aplikacja produkcyjna** |
| Build APK lokalnie | `npm run build:apk:local` |

---

## Komendy dev (skrót)

Z `info.txt` / `package.json`:

```bash
npx expo start                  # Metro, ten sam pakiet produkcyjny
adb reverse tcp:8081 tcp:8081   # fizyczne urządzenie
npx expo run:android
npm run build:apk:local         # lokalny release APK
npm run build:production:android # EAS, AAB
```
---

## Pułapki i konwencje kodu

- **Język UI:** polskie stringi w produkcie; komentarze w kodzie często po polsku.
- **Axios `validateStatus`:** 4xx nie rzuca — parsuj HTML i używaj `assertAuthenticatedHtml` / `responseIndicatesSessionExpired`.
- **Ścieżki importów:** w `core` często `"../../auth/..."`; w `features` względem `../../../core/...`.
- **Singleton service w hooku:** `const svc = new XService()` na poziomie modułu lub `useMemo` — nie twórz nowego przy każdym renderze w pętli.
- **Nie commituj** `node_modules/`, artefaktów `.gradle`, `.cxx` — szum z buildów Android.
- **Wersja:** jedno źródło `app/version.ts`; buildNumber/versionCode = liczba z wersji semantycznej (np. 0.1.3 → 103).

---

## Ostatnie obszary w rozwoju (stan repo)

Śledź zmiany poza `queryKeys` (często untracked w git):

- Profil: `StudentProfileContext`, `useStudentProfileQuery`, `useProfilePhoto`; awatar — `profilePhotoSessionCache` + `profileSummaryPhoto.ts` (nie duplikować w RQ)
- `performSignOut` czyści `profilePhotoSessionCache`
- Komponenty: `AppHeaderAvatar`, `ProfileSummaryView`, `DashboardMiniProfile`, `SidebarProfileHeader`

**Zdjęcie profilu:** jedna kopia w RAM — `profilePhotoSessionCache` (czyszczone przy wylogowaniu). `profile.summary` w React Query i na dysku **bez** pola `photo` (puste `photo`); scraper zapisuje base64 tylko do cache sesji (`profileSummaryPhoto.ts`). Po restarcie awatar pobierany ponownie przy sync profilu.

---

## Szybkie wyszukiwanie (grep)

```
queryKeys.          # wszystkie klucze cache
useUserPersistentQuery
class .*Service
parseHTML
ensureAuthenticated
WD_BASE_URL
navigateTo(
getAppEnv
```

---

*Ostatnia aktualizacja przewodnika: 2026-10-18. Przy większych zmianach architektury zaktualizuj ten plik w tym samym PR.*
