import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolWindExampleComponent } from './examples';

/**
 * @status:warning EXPERIMENTAL
 */
const FlowLayerPage: NgDocPage = {
  title: 'FlowLayer',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'flow-layer',
  demos: {
    WolWindExampleComponent,
  },
};

export default FlowLayerPage;
