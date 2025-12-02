import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('./pages/landing/landing.routes'),
    pathMatch: 'full',
  },
  {
    path: 'guide',
    loadChildren: () => import('./pages/guide/guide.routes'),
  },
  {
    path: 'components',
    loadChildren: () => import('./pages/components/components.routes'),
  },
];
