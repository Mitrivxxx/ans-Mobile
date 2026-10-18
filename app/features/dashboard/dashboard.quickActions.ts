import type { ImageSourcePropType } from 'react-native';

import { featureAccents } from '../../theme/featureAccents';

/** Kolor akcentu harmonogramu — przycisk na dashboardzie i wybrane dni w panelu. */
export const HARMONOGRAM_ACCENT_COLOR = featureAccents.plan;

/** Akcent panelu ocen na dashboardzie (zgodny z kafelkiem quick action). */
export const GRADES_ACCENT_COLOR = featureAccents.grades;

/** Akcent panelu ogłoszeń na dashboardzie. */
export const ANNOUNCEMENTS_ACCENT_COLOR = featureAccents.announcements;

export type DashboardQuickAction = {
  title: string;
  image: ImageSourcePropType;
  fillColor: string;
  imageScale?: number;
};

export const DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    title: 'Plan zajęć',
    image: require('../../../assets/icons/calendar.png'),
    fillColor: HARMONOGRAM_ACCENT_COLOR,
  },
  {
    title: 'Przedmioty i oceny',
    image: require('../../../assets/icons/school.png'),
    fillColor: GRADES_ACCENT_COLOR,
    imageScale: 1.2,
  },
  {
    title: 'Ogłoszenia',
    image: require('../../../assets/icons/bell.png'),
    fillColor: ANNOUNCEMENTS_ACCENT_COLOR,
  },
];
