// eslint-disable-next-line
import { NG_DOC_ROUTING } from '@ng-doc/generated';

import { Routes } from '@angular/router';

import { GuideComponent } from './guide.component';

const GUIDE_CHILDREN_ROUTES =
  NG_DOC_ROUTING.find((route) => route.title === 'Guide')?.children ?? [];

const routes: Routes = [
  {
    path: '',
    component: GuideComponent,
    children: GUIDE_CHILDREN_ROUTES,
  },
];

export default routes;
