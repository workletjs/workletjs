import { Routes } from '@angular/router';
import { NG_DOC_ROUTING } from '@ng-doc/generated';
import { ComponentsComponent } from './components.component';

const COMPONENTS_CHILDREN_ROUTES =
  NG_DOC_ROUTING.find((route) => route.title === 'Components')?.children ?? [];

const routes: Routes = [
  {
    path: '',
    component: ComponentsComponent,
    children: [
      {
        path: '',
        redirectTo: 'general/map',
        pathMatch: 'full',
      },
      ...COMPONENTS_CHILDREN_ROUTES,
    ],
  },
];

export default routes;
