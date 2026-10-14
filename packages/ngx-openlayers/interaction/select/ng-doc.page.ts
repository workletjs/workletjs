import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import {
  WolSelectFeaturesExampleComponent,
  WolSelectHoverFeaturesExampleComponent,
  WolSelectMultipleFeaturesExampleComponent,
} from './examples';

const SelectInteractionPage: NgDocPage = {
  title: 'Select',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'select',
  demos: {
    WolSelectFeaturesExampleComponent,
    WolSelectHoverFeaturesExampleComponent,
    WolSelectMultipleFeaturesExampleComponent,
  },
};

export default SelectInteractionPage;
