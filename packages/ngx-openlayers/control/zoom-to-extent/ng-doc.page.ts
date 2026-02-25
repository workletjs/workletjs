import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolZoomToExtentControlExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ZoomToExtentControlPage: NgDocPage = {
  title: 'ZoomToExtent',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'zoom-to-extent',
  demos: {
    WolZoomToExtentControlExampleComponent,
  },
};

export default ZoomToExtentControlPage;
