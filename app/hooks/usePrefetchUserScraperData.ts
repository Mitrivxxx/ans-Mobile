import { useEffect, useRef } from "react";

import { useAuthSession } from "../context/AuthSessionContext";
import { prefetchUserScraperData } from "../core/queryClient/prefetchUserScraperData";
import { queryClient } from "../core/queryClient/queryClient";
import { useQueryUserKey } from "../core/queryClient/useQueryUserKey";
import { confirmWdSessionAfterLogin } from "../core/scraper/auth/sessionValidation";

/** Jednorazowy prefetch po potwierdzonej sesji WD (nie przed zakończeniem logowania). */
export function usePrefetchUserScraperData(): void {
  const { authStatus, sessionDegraded } = useAuthSession();
  const userKey = useQueryUserKey();
  const prefetchedForKeyRef = useRef<string | null>(null);
  const prefetchRunIdRef = useRef(0);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      prefetchedForKeyRef.current = null;
      void queryClient.cancelQueries();
      return;
    }

    if (sessionDegraded || !userKey) {
      if (sessionDegraded) {
        prefetchedForKeyRef.current = null;
      }
      return;
    }

    if (prefetchedForKeyRef.current === userKey) {
      return;
    }

    const runId = ++prefetchRunIdRef.current;

    void (async () => {
      const sessionReady = await confirmWdSessionAfterLogin();
      if (runId !== prefetchRunIdRef.current) {
        return;
      }
      if (!sessionReady) {
        return;
      }
      if (prefetchedForKeyRef.current === userKey) {
        return;
      }

      prefetchedForKeyRef.current = userKey;
      prefetchUserScraperData(userKey);
    })();
  }, [authStatus, sessionDegraded, userKey]);
}
