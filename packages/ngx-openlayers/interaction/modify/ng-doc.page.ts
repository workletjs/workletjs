import { NgDocPage } from '@ng-doc/core';
import InteractionsCategory from '../../ng-doc/interactions/ng-doc.category';
import { WolModifyFeaturesExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ModifyInteractionPage: NgDocPage = {
  title: 'Modify',
  mdFile: './docs/index.md',
  category: InteractionsCategory,
  route: 'modify',
  demos: {
    WolModifyFeaturesExampleComponent,
  },
};

export default ModifyInteractionPage;
