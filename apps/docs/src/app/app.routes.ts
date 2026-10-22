import { Route } from '@angular/router';

export const APP_ROUTES: Route[] = [
  {
    path: 'guides',
    loadChildren: () => import('./pages/guides/guides.routes'),
  },
  {
    path: 'components',
    loadChildren: () => import('./pages/components/components.routes'),
  },
  {
    path: '',
    loadChildren: () => import('./pages/landing/landing.routes'),
    pathMatch: 'full',
    data: { hideSidebar: true },
  },
  {
    path: '**',
    redirectTo: 'guides/get-started/installation',
    pathMatch: 'full',
  },
];
