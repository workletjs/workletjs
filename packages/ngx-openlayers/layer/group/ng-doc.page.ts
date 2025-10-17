import { NgDocPage } from '@ng-doc/core';
import LayersCategory from '../ng-doc.category';
import { WolLayerGroupsExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const LayerGroupPage: NgDocPage = {
  title: 'Group',
  mdFile: './docs/index.md',
  order: 1,
  category: LayersCategory,
  route: 'group',
  demos: {
    WolLayerGroupsExampleComponent,
  },
};

export default LayerGroupPage;
