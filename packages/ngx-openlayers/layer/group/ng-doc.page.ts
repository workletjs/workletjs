import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../../ng-doc/layers/ng-doc.category';
import { WolLayerGroupsExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const LayerGroupPage: NgDocPage = {
  title: 'Group',
  mdFile: './docs/index.md',
  category: LayersCategory,
  route: 'group',
  order: 1,
  demos: {
    WolLayerGroupsExampleComponent,
  },
};

export default LayerGroupPage;
