import type { ImageSourcePropType } from 'react-native';

/** Kolor akcentu harmonogramu — przycisk na dashboardzie i wybrane dni w panelu. */
export const HARMONOGRAM_ACCENT_COLOR = '#548DF3';

export type DashboardQuickAction = {
  title: string;
  image: ImageSourcePropType;
  fillColor: string;
  imageScale?: number;
};

export const DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    title: 'Harmonogram',
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
