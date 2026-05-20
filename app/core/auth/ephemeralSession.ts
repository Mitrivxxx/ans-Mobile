/**
 * Sesja bez „Zapamiętaj mnie”: ważna tylko w bieżącym procesie aplikacji.
 * Po zabiciu aplikacji flaga znika — przy starcie nie używamy zapisanych ciasteczek WD.
 */
let ephemeralSessionActive = false;

export function isEphemeralSessionActive(): boolean {
  return ephemeralSessionActive;
}

export function setEphemeralSessionActive(active: boolean): void {
  ephemeralSessionActive = active;
}

export function clearEphemeralSession(): void {
  ephemeralSessionActive = false;
}
