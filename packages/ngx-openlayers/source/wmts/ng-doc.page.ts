import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolWMTSSourceExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const WMTSSourcePage: NgDocPage = {
  title: 'WMTS',
  mdFile: './docs/index.md',
  order: 25,
  category: SourcesCategory,
  route: 'wmts',
  demos: {
    WolWMTSSourceExampleComponent,
  },
};

export default WMTSSourcePage;
