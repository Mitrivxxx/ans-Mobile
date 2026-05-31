# WDMobile

Mobilna aplikacja (Expo / React Native) dla studentów **Wyższej Szkoły Nauk** — dane z portalu WD (`https://wd.ans-ns.edu.pl`) przez scraper HTML (bez oficjalnego API).

## Wymagania

- Node.js 22+
- npm
- [Expo](https://docs.expo.dev/) / konto EAS (buildy natywne)
- Android: Android Studio lub urządzenie + `adb` (dev)

## Szybki start (dev)

```bash
npm ci
npx expo start
```

Na fizycznym urządzeniu z Metro: `adb reverse tcp:8081 tcp:8081`.

## Buildy i środowiska

| Środowisko | Profil EAS | Package (Android) |
|------------|------------|-------------------|
| development | `development` | `pl.matsma.WDMobile.dev` |
| demo | `demo` | `pl.matsma.WDMobile.demo` |
| production | `github` / `production` | `pl.matsma.WDMobile` |

```bash
npm run build:github          # APK prod (GitHub Releases / internal)
npm run build:production      # AAB sklep Play
```

Nowe wersje aplikacji wymagają **nowej instalacji** (APK/AAB) — bez aktualizacji OTA w tle.

Wersja aplikacji: `app/version.ts` (zsynchronizuj z `package.json` i `app.json` przy release).

Szczegóły architektury, cache, scraper: **[AGENTS.md](./AGENTS.md)**.

## Testy

```bash
npm test
```

## Gałąź `main`

Kod produkcyjny utrzymuj na `main`. Rozwój na `dev`, merge do `main` po przejściu testów i buildu prod.
