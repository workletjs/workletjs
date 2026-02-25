import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolDoubleClickDragZoomExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const DblClickDragZoomInteractionPage: NgDocPage = {
  title: 'DblClickDragZoom',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'dbl-click-drag-zoom',
  demos: {
    WolDoubleClickDragZoomExampleComponent,
  },
};

export default DblClickDragZoomInteractionPage;
