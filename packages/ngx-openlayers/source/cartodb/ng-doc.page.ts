import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolCartoDBSourceExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const CartoDBSourcePage: NgDocPage = {
  title: 'CartoDB',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'cartodb',
  demos: {
    WolCartoDBSourceExampleComponent,
  },
};

export default CartoDBSourcePage;
