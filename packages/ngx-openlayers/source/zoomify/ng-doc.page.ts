import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolZoomifySourceExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ZoomifySourcePage: NgDocPage = {
  title: 'Zoomify',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'zoomify',
  demos: {
    WolZoomifySourceExampleComponent,
  },
};

export default ZoomifySourcePage;
