import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import {
  WolSnapCustomSegmenterExampleComponent,
  WolSnapInteractionExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const SnapInteractionPage: NgDocPage = {
  title: 'Snap',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'snap',
  demos: {
    WolSnapCustomSegmenterExampleComponent,
    WolSnapInteractionExampleComponent,
  },
};

export default SnapInteractionPage;
