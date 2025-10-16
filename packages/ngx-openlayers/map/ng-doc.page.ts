import { NgDocPage } from '@ng-doc/core';
import GeneralCategory from '../ng-doc.category';
import { WolAccessibleMapExampleComponent, WolSimpleMapExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const MapPage: NgDocPage = {
  title: 'Map',
  mdFile: './docs/index.md',
  order: 1,
  category: GeneralCategory,
  route: 'map',
  demos: {
    WolAccessibleMapExampleComponent,
    WolSimpleMapExampleComponent,
  },
};

export default MapPage;
