import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolBoxSelectionExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const DragBoxInteractionPage: NgDocPage = {
  title: 'DragBox',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'drag-box',
  demos: {
    WolBoxSelectionExampleComponent,
  },
};

export default DragBoxInteractionPage;
