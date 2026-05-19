import { useMemo } from 'react';

import { useAppTheme } from '../context/AppThemeContext';
import type { AnsColors } from './ansTheme';

export function useThemedStyles<T>(
  factory: (colors: AnsColors) => T
): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
