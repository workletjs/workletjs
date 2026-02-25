import { NgDocPage } from '@ng-doc/core';

import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolGraticuleLayerExampleComponent, WolSphereMollweideExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const GraticuleLayerPage: NgDocPage = {
  title: 'GraticuleLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'graticule-layer',
  order: 2,
  demos: {
    WolGraticuleLayerExampleComponent,
    WolSphereMollweideExampleComponent,
  },
};

export default GraticuleLayerPage;
