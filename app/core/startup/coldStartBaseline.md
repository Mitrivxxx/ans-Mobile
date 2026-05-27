# Baseline cold start (before refactor)

Data pomiaru: 2026-05-27

## Metryki

- `AppInitGate -> ready` (ms)
- `restoreSession -> resolved` (ms)
- `App start -> AuthNavigator first render` (ms)
- `App start -> MainNavigator first render` (ms)

## Scenariusze

1. Remember me + online
2. Remember me + offline (degraded)
3. Bez remember me

## Baseline (do uzupełnienia logami runtime)

- remember + online:
  - AppInitGate -> ready: pending
  - restoreSession -> resolved: pending
  - first useful render: pending
- remember + offline (degraded):
  - AppInitGate -> ready: pending
  - restoreSession -> resolved: pending
  - first useful render: pending
- no remember:
  - AppInitGate -> ready: pending
  - restoreSession -> resolved: pending
  - first useful render: pending

## Jak zbierać logi

Uruchom appkę w trybie dev i odczytaj wpisy:

- `[WDMobile:Startup] AppInitGate -> ready: ...ms`
- `[WDMobile:Startup] restoreSession -> resolved: ...ms`
- `[WDMobile:Startup] App start -> AuthNavigator first render: ...ms`
- `[WDMobile:Startup] App start -> MainNavigator first render: ...ms`
