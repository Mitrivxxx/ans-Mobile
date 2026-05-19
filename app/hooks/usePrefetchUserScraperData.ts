import { useEffect, useRef } from "react";

import { useAuthSession } from "../context/AuthSessionContext";
import { prefetchUserScraperData } from "../core/queryClient/prefetchUserScraperData";
import { useQueryUserKey } from "../core/queryClient/useQueryUserKey";

/** Jednorazowy prefetch po sesji: plan tygodnia, potem pozostałe dane w tle. */
export function usePrefetchUserScraperData(): void {
  const { authStatus } = useAuthSession();
  const userKey = useQueryUserKey();
  const prefetchedForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      prefetchedForKeyRef.current = null;
      return;
    }

    if (prefetchedForKeyRef.current === userKey) {
      return;
    }

    prefetchedForKeyRef.current = userKey;
    prefetchUserScraperData(userKey);
  }, [authStatus, userKey]);
}
