import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolImageVectorLayerExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const VectorImageLayerPage: NgDocPage = {
  title: 'VectorImageLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'vector-image-layer',
  order: 7,
  demos: {
    WolImageVectorLayerExampleComponent,
  },
};

export default VectorImageLayerPage;
