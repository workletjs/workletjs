import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import {
  WolWebGLLayerSwipeExampleComponent,
  WolWebGLSeaLevelExampleComponent,
  WolWebGLShadedReliefExampleComponent,
  WolWebGLTilesExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const WebGLTileLayerPage: NgDocPage = {
  title: 'WebGLTileLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'webgl-tile',
  order: 9,
  demos: {
    WolWebGLLayerSwipeExampleComponent,
    WolWebGLSeaLevelExampleComponent,
    WolWebGLShadedReliefExampleComponent,
    WolWebGLTilesExampleComponent,
  },
};

export default WebGLTileLayerPage;
