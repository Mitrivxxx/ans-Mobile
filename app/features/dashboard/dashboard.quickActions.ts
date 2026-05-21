import type { ImageSourcePropType } from 'react-native';

/** Kolor akcentu harmonogramu — przycisk na dashboardzie i wybrane dni w panelu. */
export const HARMONOGRAM_ACCENT_COLOR = '#548DF3';

/** Tło kafelka „dziś” — ten sam żółty co wybrany dzień w planie zajęć. */
export const HARMONOGRAM_TODAY_DAY_COLOR = '#F5D547';

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
    fillColor: '#2EAAA0',
    imageScale: 1.2,
  },
  {
    title: 'Ogłoszenia',
    image: require('../../../assets/icons/bell.png'),
    fillColor: '#F2703F',
  },
];
