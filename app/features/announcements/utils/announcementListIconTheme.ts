import type { AnnouncementListIcon } from '../../../core/scraper/features/announcements/announcements.types';
import type { AnsColors } from '../../../theme/ansTheme';

/** Kolor paska priorytetu po lewej — jak lessonAccent w harmonogramie. */
export function resolveAnnouncementListAccentColor(
  icon: AnnouncementListIcon | null,
  colors: AnsColors
): string | null {
  switch (icon) {
    case 'exclamation':
      return colors.error;
    case 'triangle-exclamation':
      return colors.goldLight;
    case 'circle-info':
      return colors.dashboardBlue;
    default:
      return null;
  }
}

export function announcementListIconA11ySuffix(
  icon: AnnouncementListIcon | null
): string {
  switch (icon) {
    case 'exclamation':
      return ', priorytet wysoki';
    case 'triangle-exclamation':
      return ', ostrzeżenie';
    case 'circle-info':
      return ', informacja';
    default:
      return '';
  }
}
