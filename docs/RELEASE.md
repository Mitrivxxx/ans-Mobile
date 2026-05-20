# Publikacja buildów na GitHub (Android + iOS)

Projekt używa [EAS Build](https://docs.expo.dev/build/introduction/) do budowania **AAB** / **IPA** dla profili `github` / `preview` / `production` (wersje dystrybuowalne; lżej niż osobny build typu „development client”). Lokalnie: **Metro** (`npm start`) oraz natywna aplikacja debug z `npm run android` / `npm run ios`. Gotowe archiwa przy tagach mogą trafiać na **GitHub Releases**.

## Jednorazowa konfiguracja

### 1. Konto Expo

1. Zaloguj się na [expo.dev](https://expo.dev) tym samym kontem, które ma dostęp do projektu (`projectId` w `app.json`).
2. Lokalnie (jednorazowo):

   ```bash
   npm install -g eas-cli
   eas login
   eas whoami
   ```

### 2. Sekret `EXPO_TOKEN` w GitHubie

1. Utwórz token: **Expo** → *Account Settings* → *Access Tokens* → *Create*.
2. W repozytorium GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. Nazwa: `EXPO_TOKEN`, wartość: wklejony token.

Bez tego sekretu workflow `Release builds` się nie wykona.

### 3. iOS — Apple Developer (wymagane do IPA)

- Potrzebny jest **Apple Developer Program** (płatne konto).
- Przy pierwszym buildzie iOS uruchom lokalnie (żeby EAS mógł przeprowadzić Cię przez certyfikaty):

  ```bash
  npm run build:ios
  ```

  albo odpal workflow ręcznie — EAS poprosi o dane Apple w panelu [expo.dev](https://expo.dev) → projekt → *Credentials*.

- Dystrybucja profilu `github` to **internal / ad hoc** — IPA zainstalujesz tylko na urządzeniach dodanych do profilu provisioning w EAS.

### 4. Android — podpisywanie

EAS domyślnie tworzy keystore przy pierwszym buildzie Android. Nie musisz commitować `.jks` do repozytorium.

## Wersjonowanie przed release

Zaktualizuj wersję w trzech miejscach (muszą być spójne):

| Plik | Pola |
|------|------|
| `app/version.ts` | `APP_VERSION`, `ANDROID_VERSION_CODE`, `IOS_BUILD_NUMBER` |
| `app.json` | `expo.version`, `android.versionCode`, `ios.buildNumber` |
| `package.json` | `version` |

`ANDROID_VERSION_CODE` i `ios.buildNumber` muszą rosnąć przy każdym nowym buildzie w sklepie / dystrybucji.

## Publikacja na GitHub Releases

### Opcja A — tag (zalecane)

```bash
git add .
git commit -m "chore: release 0.1.2"
git tag v0.1.2
git push origin main
git push origin v0.1.2
```

Push tagu `v*` uruchamia workflow **Release builds**, buduje AAB + IPA i tworzy **GitHub Release** z oboma plikami.

### Opcja B — ręcznie z Actions

1. GitHub → **Actions** → **Release builds** → **Run workflow**.
2. Zaznacz *Publish GitHub Release* jeśli chcesz od razu release (bez tagu użyty zostanie bieżący ref).

## Build lokalny (bez GitHub Actions)

```bash
npm run build:github          # Android + iOS
npm run build:github:android  # Android (AAB, profil github)
npm run build:github:ios      # tylko IPA
```

Po zakończeniu pobierz plik z linku w terminalu albo:

```bash
eas build:list --platform android --limit 1
```

## Rozwój lokalny (bez EAS)

W repozytorium nie ma profilu EAS dla „development clientów” — unikasz ciężkich osobnych buildów EAS przeznaczonych tylko pod dev menu.

1. Raz (albo po zmianach w paczkach natywnych): `npm run android` lub `npm run ios`.
2. Na co dzień: `npm start` (Metro) — aplikacja z kroku 1 łączy się jak zwykle w trybie deweloperskim.

Jeśli coś zostało nietrafione w `android/` / `ios/`, przywróć katalogi: `npx expo prebuild --clean`.

## Profile EAS

| Profil | Cel |
|--------|-----|
| `github` | AAB + IPA pod GitHub Releases (mniejszy Android niż APK; instalacja przez Play lub `bundletool`) |
| `preview` | AAB testowy (wewnętrznie, jak wyżej) |
| `production` | AAB pod Google Play (+ submit) |

## Instalacja przez użytkowników

- **Android (AAB z Releases):** plik `.aab` nie instaluje się „klik jak APK”. Typowo wgrywasz paczkę w [Google Play Console](https://play.google.com/console) (ścieżka wewnętrzna lub closed testing) i instalujesz ze sklepu. Albo na urządzeniu lub w CI wygenerujesz zestaw APK poleceniem [`bundletool build-apks`](https://developer.android.com/tools/bundletool), a potem zainstalujesz przez `bundletool install-apks`.
- **iOS:** `.ipa` z Releases nie instaluje się jak APK; typowo używa się linku instalacyjnego EAS (*internal distribution*) lub TestFlight. Dla ad hoc urządzenie musi być zarejestrowane w Apple Developer / EAS.

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---------|-------------|
| `EXPO_TOKEN` missing | Dodaj sekret w GitHub Settings |
| iOS build failed — credentials | `eas credentials` lub panel Expo → Credentials |
| Android version code conflict | Zwiększ `android.versionCode` w `app.json` |
| Brak pliku w Release | Sprawdź logi jobów `EAS (android)` i `EAS (ios)` — oba muszą się powieść |
