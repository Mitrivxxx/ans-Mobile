import { darkenHex } from '../../theme/colorUtils';

/** W ciemnym motywie duże nasycone płaszczyzny wydziałów są przyciemniane (odcień bez zmian). */
const DARK_MODE_DEPARTMENT_DARKEN = 0.22;

export function resolveDepartmentPanelColor(
  departmentColor: string,
  isDarkMode: boolean
): string {
  return isDarkMode
    ? darkenHex(departmentColor, DARK_MODE_DEPARTMENT_DARKEN)
    : departmentColor;
}
