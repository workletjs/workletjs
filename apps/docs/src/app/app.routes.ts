import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('./pages/landing/landing.routes'),
    pathMatch: 'full',
  },
];
