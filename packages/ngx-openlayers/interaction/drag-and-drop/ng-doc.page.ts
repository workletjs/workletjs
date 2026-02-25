import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolDragAndDropInteractionExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const DragAndDropInteractionPage: NgDocPage = {
  title: 'DragAndDrop',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'drag-and-drop',
  demos: {
    WolDragAndDropInteractionExampleComponent,
  },
};

export default DragAndDropInteractionPage;
