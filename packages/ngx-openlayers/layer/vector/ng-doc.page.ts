import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolVectorLayerExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const VectorLayerPage: NgDocPage = {
  title: 'VectorLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'vector-layer',
  order: 6,
  demos: {
    WolVectorLayerExampleComponent,
  },
};

export default VectorLayerPage;
