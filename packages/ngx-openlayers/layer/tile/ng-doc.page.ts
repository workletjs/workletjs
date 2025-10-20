import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../ng-doc.category';
import { WolPreloadTilesExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const TileLayerPage: NgDocPage = {
  title: 'TileLayer',
  mdFile: './docs/index.md',
  order: 2,
  category: LayersCategory,
  route: 'tile',
  demos: {
    WolPreloadTilesExampleComponent,
  },
};

export default TileLayerPage;
