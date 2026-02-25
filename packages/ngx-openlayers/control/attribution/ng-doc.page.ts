import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolAttributionsExampleComponent, WolStaticAttributionExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const AttributionControlPage: NgDocPage = {
  title: 'Attribution',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'attribution',
  demos: {
    WolAttributionsExampleComponent,
    WolStaticAttributionExampleComponent,
  },
};

export default AttributionControlPage;
