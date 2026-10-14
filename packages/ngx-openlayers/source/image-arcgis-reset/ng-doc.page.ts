import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolArcGISImageExampleComponent } from './examples';

const ImageArcGISResetSourcePage: NgDocPage = {
  title: 'ImageArcGISRest',
  mdFile: './docs/index.md',
  order: 21,
  category: SourcesCategory,
  route: 'image-arcgis-rest',
  demos: {
    WolArcGISImageExampleComponent,
  },
};

export default ImageArcGISResetSourcePage;
