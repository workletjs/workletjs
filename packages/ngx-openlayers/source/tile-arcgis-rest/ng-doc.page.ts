import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolArcGISTiledExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const TileArcGISRestSourcePage: NgDocPage = {
  title: 'TileArcGISRest',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'tile-arcgis-rest',
  demos: {
    WolArcGISTiledExampleComponent,
  },
};

export default TileArcGISRestSourcePage;
