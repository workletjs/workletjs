import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolPreloadTilesExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const TileLayerPage: NgDocPage = {
  title: 'TileLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'tile',
  order: 5,
  demos: {
    WolPreloadTilesExampleComponent,
  },
};

export default TileLayerPage;
