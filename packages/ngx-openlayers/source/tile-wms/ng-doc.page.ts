import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import {
  WolTiledWMSExampleComponent,
  WolTiledWMSWrappingExampleComponent,
  WolWMSCustomTileGridExampleComponent,
  WolWMSTimeExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const TileWMSSourcePage: NgDocPage = {
  title: 'TileWMS',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'tile-wms',
  demos: {
    WolTiledWMSExampleComponent,
    WolTiledWMSWrappingExampleComponent,
    WolWMSCustomTileGridExampleComponent,
    WolWMSTimeExampleComponent,
  },
};

export default TileWMSSourcePage;
