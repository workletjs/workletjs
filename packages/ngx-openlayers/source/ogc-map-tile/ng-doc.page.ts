import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import {
  WolOGCMapTilesExampleComponent,
  WolOGCMapTilesGeographicExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const OGCMapTileSourcePage: NgDocPage = {
  title: 'OGCMapTile',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'ogc-map-tile',
  demos: {
    WolOGCMapTilesExampleComponent,
    WolOGCMapTilesGeographicExampleComponent,
  },
};

export default OGCMapTileSourcePage;
