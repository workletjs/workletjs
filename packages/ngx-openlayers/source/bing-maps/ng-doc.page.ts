import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolBingMapsExampleComponent } from './examples';

/**
 * @status:alert Deprecated
 */
const BingMapsSourcePage: NgDocPage = {
  title: 'BingMaps',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'bing-maps',
  demos: {
    WolBingMapsExampleComponent,
  },
};

export default BingMapsSourcePage;
