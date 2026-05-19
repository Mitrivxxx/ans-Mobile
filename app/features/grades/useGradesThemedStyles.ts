import { useMemo } from 'react';

import type { GradesColors } from './gradesTheme';
import { useGradesColors } from './useGradesColors';

export function useGradesThemedStyles<T>(
  factory: (colors: GradesColors) => T
): T {
  const colors = useGradesColors();
  return useMemo(() => factory(colors), [colors, factory]);
}
