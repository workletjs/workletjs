import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import {
  WolStadiaMapsSourceRetinaTilesExampleComponent,
  WolStadiaMapsSourceStamenTileLayerCompositionExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const StadiaMapsSourcePage: NgDocPage = {
  title: 'StadiaMaps',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'stadia-maps',
  demos: {
    WolStadiaMapsSourceRetinaTilesExampleComponent,
    WolStadiaMapsSourceStamenTileLayerCompositionExampleComponent,
  },
};

export default StadiaMapsSourcePage;
