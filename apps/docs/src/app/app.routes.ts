import { NG_DOC_ROUTING } from '@ng-doc/generated';

import { inject } from '@angular/core';
import { RedirectFunction, Route, Router } from '@angular/router';

function documentationCategory(path: string, defaultPage: string): Route {
  const category = NG_DOC_ROUTING.find((route) => route.path === path);

  return {
    ...category,
    path,
    children: [
      { path: '', redirectTo: defaultPage, pathMatch: 'full' },
      ...(category?.children ?? []).filter(
        (route) => !(route.path === '' && route.redirectTo !== undefined),
      ),
    ],
  };
}

function legacyGuideRedirect(target: string): RedirectFunction {
  return ({ queryParams, fragment }) =>
    inject(Router).createUrlTree([target], { queryParams, fragment: fragment ?? undefined });
}

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('./pages/landing/landing.routes'),
    pathMatch: 'full',
  },
  documentationCategory('get-started', 'overview'),
  documentationCategory('development', 'component-usage'),
  documentationCategory('reference', 'angular-cli'),
  {
    path: 'guide',
    pathMatch: 'full',
    redirectTo: legacyGuideRedirect('/get-started/overview'),
  },
  {
    path: 'guide/introduction',
    pathMatch: 'full',
    redirectTo: legacyGuideRedirect('/get-started/overview'),
  },
  {
    path: 'guide/getting-started',
    pathMatch: 'full',
    redirectTo: legacyGuideRedirect('/get-started/installation'),
  },
  {
    path: 'components',
    loadChildren: () => import('./pages/components/components.routes'),
  },
];
