import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolDragRotateAndZoomExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const DragRotateAndZoomInteractionPage: NgDocPage = {
  title: 'DragRotateAndZoom',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'drag-rotate-and-zoom',
  demos: {
    WolDragRotateAndZoomExampleComponent,
  },
};

export default DragRotateAndZoomInteractionPage;
