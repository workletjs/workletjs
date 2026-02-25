import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolDoubleClickZoomExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const DoubleClickZoomInteractionPage: NgDocPage = {
  title: 'DoubleClickZoom',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'double-click-zoom',
  demos: {
    WolDoubleClickZoomExampleComponent,
  },
};

export default DoubleClickZoomInteractionPage;
