import { NgDocPage } from '@ng-doc/core';

import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolWebGLVectorLayerExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const WebGLVectorLayerPage: NgDocPage = {
  title: 'WebGLVectorLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'webgl-vector',
  order: 10,
  demos: {
    WolWebGLVectorLayerExampleComponent,
  },
};

export default WebGLVectorLayerPage;
