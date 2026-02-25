import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import {
  WolOGCVectorTilesExampleComponent,
  WolOGCVectorTilesGeographicExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const OGCVectorTileSourcePage: NgDocPage = {
  title: 'OGCVectorTile',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'ogc-vector-tile',
  demos: {
    WolOGCVectorTilesExampleComponent,
    WolOGCVectorTilesGeographicExampleComponent,
  },
};

export default OGCVectorTileSourcePage;
