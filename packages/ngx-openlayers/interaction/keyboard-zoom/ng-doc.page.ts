import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolKeyboardZoomInteractionExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const KeyboardZoomInteractionPage: NgDocPage = {
  title: 'KeyboardZoom',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'keyboard-zoom',
  demos: {
    WolKeyboardZoomInteractionExampleComponent,
  },
};

export default KeyboardZoomInteractionPage;
