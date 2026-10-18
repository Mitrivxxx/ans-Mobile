import { featureAccents } from '../../theme/featureAccents';
import type { DashboardFeature } from './dashboard.types';

/** Kolor akcentu finansów — sidebar i baner sync na ekranie opłat. */
export const FINANCE_ACCENT_COLOR = featureAccents.finance;

export const DASHBOARD_FEATURES: DashboardFeature[] = [
  {
    icon: 'plan',
    title: 'Plan zajęć',
    description: 'Harmonogram zajęć na bieżący semestr',
    route: 'Plan',
    accentColor: featureAccents.plan,
  },
  {
    icon: 'grades',
    title: 'Przedmioty i oceny',
    description: 'Wyniki i średnie z przedmiotów',
    route: 'Grades',
    accentColor: featureAccents.grades,
  },
  {
    icon: 'announcements',
    title: 'Ogłoszenia',
    description: 'Komunikaty i wiadomości z uczelni',
    route: 'Announcements',
    accentColor: featureAccents.announcements,
  },
  {
    icon: 'profile',
    title: 'Profil',
    description: 'Dane konta i ustawienia studenta',
    route: 'Profile',
    accentColor: featureAccents.profile,
  },
  {
    icon: 'lecturer',
    title: 'Znajdź prowadzącego',
    description: 'Wyszukaj prowadzącego i jego plan zajęć',
    route: 'FindLecturer',
    accentColor: featureAccents.lecturer,
  },
  {
    icon: 'finance',
    title: 'Finanse',
    description: 'Opłaty i informacje finansowe',
    route: 'Finanse',
    accentColor: FINANCE_ACCENT_COLOR,
  },
];
