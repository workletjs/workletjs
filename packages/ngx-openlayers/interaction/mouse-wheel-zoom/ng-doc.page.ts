import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolMouseWheelZoomInteractionExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const MouseWheelZoomInteractionPage: NgDocPage = {
  title: 'MouseWheelZoom',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'mouse-wheel-zoom',
  demos: {
    WolMouseWheelZoomInteractionExampleComponent,
  },
};

export default MouseWheelZoomInteractionPage;
