import { useEffect, useRef, useState } from 'react';

import { waitForMinSplashDisplay } from '../core/preferences/splashTheme';

/**
 * Gdy `active` przechodzi na false, utrzymuje true co najmniej do upływu
 * {@link SPLASH_MIN_DISPLAY_MS} od momentu wejścia active w true.
 */
export function useMinSplashDisplay(active: boolean): boolean {
  const [displayActive, setDisplayActive] = useState(active);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      shownAtRef.current = Date.now();
      setDisplayActive(true);
      return;
    }

    if (shownAtRef.current === null) {
      setDisplayActive(false);
      return;
    }

    const shownAt = shownAtRef.current;
    shownAtRef.current = null;
    let cancelled = false;

    void waitForMinSplashDisplay(shownAt).then(() => {
      if (!cancelled) {
        setDisplayActive(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  return displayActive;
}
