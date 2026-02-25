import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolZoomControlExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ZoomControlPage: NgDocPage = {
  title: 'Zoom',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'zoom',
  demos: {
    WolZoomControlExampleComponent,
  },
};

export default ZoomControlPage;
