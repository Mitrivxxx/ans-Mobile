import { useAppTheme } from '../../context/AppThemeContext';
import { resolveGradesColors } from './gradesTheme';

export function useGradesColors() {
  const { isDarkMode } = useAppTheme();
  return resolveGradesColors(isDarkMode);
}
