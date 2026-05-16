import type { DashboardFeature } from './dashboard.types';

export const DASHBOARD_FEATURES: DashboardFeature[] = [
  {
    icon: 'plan',
    title: 'Plan zajęć',
    description: 'Harmonogram zajęć na bieżący semestr',
    route: 'Plan',
    accentColor: '#5B8DEF',
  },
  {
    icon: 'grades',
    title: 'Oceny',
    description: 'Wyniki i średnie z przedmiotów',
    route: 'Grades',
    accentColor: '#3CB8A0',
  },
  {
    icon: 'announcements',
    title: 'Ogłoszenia',
    description: 'Komunikaty i wiadomości z uczelni',
    route: 'Announcements',
    accentColor: '#E86B4A',
  },
  {
    icon: 'profile',
    title: 'Profil',
    description: 'Dane konta i ustawienia studenta',
    route: 'Profile',
    accentColor: '#9B6BD4',
  },
  {
    icon: 'lecturer',
    title: 'Prowadzący',
    description: 'Wyszukaj prowadzącego i jego plan zajęć',
    route: 'FindLecturer',
    accentColor: '#E8A838',
  },
];
