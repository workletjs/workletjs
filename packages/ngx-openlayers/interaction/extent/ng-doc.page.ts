import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolExtentInteractionExampleComponent } from './examples';

const ExtentInteractionPage: NgDocPage = {
  title: 'Extent',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'extent',
  demos: {
    WolExtentInteractionExampleComponent,
  },
};

export default ExtentInteractionPage;
