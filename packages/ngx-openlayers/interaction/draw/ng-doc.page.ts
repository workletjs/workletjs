import { NgDocPage } from '@ng-doc/core';

import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import {
  WolDrawFeaturesExampleComponent,
  WolDrawFeaturesStyleExampleComponent,
  WolDrawFreehandExampleComponent,
  WolDrawShapesExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const DrawInteractionPage: NgDocPage = {
  title: 'Draw',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'draw',
  demos: {
    WolDrawFeaturesExampleComponent,
    WolDrawFeaturesStyleExampleComponent,
    WolDrawFreehandExampleComponent,
    WolDrawShapesExampleComponent,
  },
};

export default DrawInteractionPage;
