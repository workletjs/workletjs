import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolScaleLineSimpleExampleComponent } from './examples';

const ScaleLineControlPage: NgDocPage = {
  title: 'ScaleLine',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'scale-line',
  demos: {
    WolScaleLineSimpleExampleComponent,
  },
};

export default ScaleLineControlPage;
