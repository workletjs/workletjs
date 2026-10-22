import { NG_DOC_ROUTING } from '@ng-doc/generated';

import { Routes } from '@angular/router';

import { GuidesComponent } from './guides.component';

const GUIDES_ROUTING: Routes =
  NG_DOC_ROUTING.find((route) => route.path === 'guides')?.children ?? [];

const routes: Routes = [
  { path: '', redirectTo: 'get-started/overview', pathMatch: 'full' },
  {
    path: '',
    component: GuidesComponent,
    children: GUIDES_ROUTING,
  },
];

export default routes;
