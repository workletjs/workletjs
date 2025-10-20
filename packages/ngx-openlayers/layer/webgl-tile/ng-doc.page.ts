import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../ng-doc.category';
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
  order: 2,
  category: LayersCategory,
  route: 'webgl-tile',
  demos: {
    WolWebGLLayerSwipeExampleComponent,
    WolWebGLSeaLevelExampleComponent,
    WolWebGLShadedReliefExampleComponent,
    WolWebGLTilesExampleComponent,
  },
};

export default WebGLTileLayerPage;
