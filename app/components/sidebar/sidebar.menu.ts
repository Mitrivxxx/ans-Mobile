import { DASHBOARD_FEATURES } from '../../features/dashboard/dashboard.features';
import type { DashboardFeature } from '../../features/dashboard/dashboard.types';

export const SIDEBAR_MENU_ITEMS: DashboardFeature[] = [
  {
    icon: 'dashboard',
    title: 'Panel główny',
    description: 'Panel główny aplikacji',
    route: 'Dashboard',
    accentColor: '#4A5568',
  },
  ...DASHBOARD_FEATURES,
  {
    icon: 'settings',
    title: 'Ustawienia',
    description: 'Preferencje aplikacji i motyw',
    route: 'Settings',
    accentColor: '#5A6575',
  },
];
