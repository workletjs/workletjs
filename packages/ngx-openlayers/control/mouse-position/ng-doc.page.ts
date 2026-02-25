import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolMousePositionControlExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const MousePositionControlPage: NgDocPage = {
  title: 'MousePosition',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'mouse-position',
  demos: {
    WolMousePositionControlExampleComponent,
  },
};

export default MousePositionControlPage;
