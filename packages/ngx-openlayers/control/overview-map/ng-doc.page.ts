import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolOverviewMapControlExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const OverviewMapControlPage: NgDocPage = {
  title: 'OverviewMap',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'overview-map',
  demos: {
    WolOverviewMapControlExampleComponent,
  },
};

export default OverviewMapControlPage;
