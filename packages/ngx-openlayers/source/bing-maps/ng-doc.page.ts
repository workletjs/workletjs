import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolBingMapsExampleComponent } from './examples';

/**
 * @status:info NEW
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
