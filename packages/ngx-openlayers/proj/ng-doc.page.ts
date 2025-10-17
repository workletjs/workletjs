import { NgDocPage } from '@ng-doc/core';
import GeneralCategory from '../ng-doc.category';
import { WolFromLonLatPipeExampleComponent, WolToLonLatPipeExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ProjPage: NgDocPage = {
  title: 'Proj',
  mdFile: './docs/index.md',
  order: 3,
  category: GeneralCategory,
  route: 'proj',
  demos: {
    WolFromLonLatPipeExampleComponent,
    WolToLonLatPipeExampleComponent,
  },
};

export default ProjPage;
