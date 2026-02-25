import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolTranslateFeaturesExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const TranslateInteractionPage: NgDocPage = {
  title: 'Translate',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'translate',
  demos: {
    WolTranslateFeaturesExampleComponent,
  },
};

export default TranslateInteractionPage;
