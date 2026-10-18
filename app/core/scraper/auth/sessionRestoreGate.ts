/** Blokuje scrape danych WD do zakończenia przywracania sesji (baner „Logowanie…”). */

let restoreInProgress = false;
const waiters: Array<() => void> = [];

export function setSessionRestoreInProgress(inProgress: boolean): void {
  if (restoreInProgress === inProgress) {
    return;
  }
  restoreInProgress = inProgress;
  if (!inProgress) {
    const pending = waiters.splice(0);
    for (const resolve of pending) {
      resolve();
    }
  }
}

export function isSessionRestoreInProgress(): boolean {
  return restoreInProgress;
}

/** Czeka, aż AuthSessionContext zakończy silent login / restore. */
export function waitForSessionRestoreComplete(): Promise<void> {
  if (!restoreInProgress) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    waiters.push(resolve);
  });
}
