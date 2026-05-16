import type { DashboardFeature } from './dashboard.types';

export const DASHBOARD_FEATURES: DashboardFeature[] = [
  {
    icon: 'plan',
    title: 'Mój plan zajęć',
    description: 'Harmonogram zajęć na bieżący semestr',
    route: 'Plan',
  },
  {
    icon: 'grades',
    title: 'Oceny',
    description: 'Wyniki i średnie z przedmiotów',
    route: 'Grades',
  },
  {
    icon: 'announcements',
    title: 'Ogłoszenia',
    description: 'Komunikaty i wiadomości z uczelni',
    route: 'Announcements',
  },
  {
    icon: 'profile',
    title: 'Profil',
    description: 'Dane konta i ustawienia studenta',
    route: 'Profile',
  },
  {
    icon: 'lecturer',
    title: 'Znajdź prowadzącego',
    description: 'Wyszukaj prowadzącego i jego plan zajęć',
    route: 'FindLecturer',
  },
];
