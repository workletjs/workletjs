import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolLinkInteractionExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const LinkInteractionPage: NgDocPage = {
  title: 'Link',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'link',
  demos: {
    WolLinkInteractionExampleComponent,
  },
};

export default LinkInteractionPage;
