import { NgDocPage } from '@ng-doc/core';

import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolWebGLVectorTilesLayerExampleComponent } from './examples';

/**
 * @status:warning EXPERIMENTAL
 */
const WebGLVectorTileLayerPage: NgDocPage = {
  title: 'WebGLVectorTileLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'webgl-vector-tile',
  demos: {
    WolWebGLVectorTilesLayerExampleComponent,
  },
};

export default WebGLVectorTileLayerPage;
