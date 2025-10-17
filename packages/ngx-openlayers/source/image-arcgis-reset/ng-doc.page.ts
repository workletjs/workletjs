import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolArcGISImageExampleComponent } from './examples';

/**
 * @status:info NEW
 */
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
