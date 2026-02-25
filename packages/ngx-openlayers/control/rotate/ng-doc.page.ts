import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolRotateControlExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const RotateControlPage: NgDocPage = {
  title: 'Rotate',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'rotate',
  demos: {
    WolRotateControlExampleComponent,
  },
};

export default RotateControlPage;
