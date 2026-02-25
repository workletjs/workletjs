import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolVectorTileInfoExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const VectorTileSourcePage: NgDocPage = {
  title: 'VectorTile',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'vector-tile',
  demos: {
    WolVectorTileInfoExampleComponent,
  },
};

export default VectorTileSourcePage;
