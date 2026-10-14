import { NgDocPage } from '@ng-doc/core';

import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import { WolZoomSliderControlExampleComponent } from './examples';

const ZoomSliderControlPage: NgDocPage = {
  title: 'ZoomSlider',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'zoom-slider',
  demos: {
    WolZoomSliderControlExampleComponent,
  },
};

export default ZoomSliderControlPage;
