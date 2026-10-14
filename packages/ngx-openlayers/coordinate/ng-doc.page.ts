import { NgDocPage } from '@ng-doc/core';

import GeneralCategory from '../ng-doc/general/ng-doc.category';
import {
  WolCoordinateAddExampleComponent,
  WolCoordinateFormatExampleComponent,
  WolCoordinateRotateExampleComponent,
  WolCoordinateToStringHDMSExampleComponent,
  WolCoordinateToStringXYExampleComponent,
} from './examples';

const CoordinatePage: NgDocPage = {
  title: 'Coordinate',
  mdFile: './docs/index.md',
  category: GeneralCategory,
  route: 'coordinate',
  demos: {
    WolCoordinateAddExampleComponent,
    WolCoordinateFormatExampleComponent,
    WolCoordinateRotateExampleComponent,
    WolCoordinateToStringHDMSExampleComponent,
    WolCoordinateToStringXYExampleComponent,
  },
};

export default CoordinatePage;
