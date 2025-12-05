import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolClusteredFeaturesExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ClusterSourcePage: NgDocPage = {
  title: 'Cluster',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'cluster',
  demos: {
    WolClusteredFeaturesExampleComponent,
  },
};

export default ClusterSourcePage;
