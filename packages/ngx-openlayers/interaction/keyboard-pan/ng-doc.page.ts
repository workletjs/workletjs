import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolKeyboardPanInteractionExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const KeyboardPanInteractionPage: NgDocPage = {
  title: 'KeyboardPan',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'keyboard-pan',
  demos: {
    WolKeyboardPanInteractionExampleComponent,
  },
};

export default KeyboardPanInteractionPage;
