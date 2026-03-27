import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolOGCMapSourceExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const OGCMapSourcePage: NgDocPage = {
  title: 'OGCMap',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'ogc-map',
  demos: {
    WolOGCMapSourceExampleComponent,
  },
};

export default OGCMapSourcePage;
