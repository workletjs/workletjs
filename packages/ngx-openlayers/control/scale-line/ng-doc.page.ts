import { NgDocPage } from '@ng-doc/core';
import ControlsCategory from '../ng-doc.category';
import { WolScaleLineSimpleExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ScaleLineControlPage: NgDocPage = {
  title: 'ScaleLine',
  mdFile: './docs/index.md',
  order: 20,
  category: ControlsCategory,
  route: 'scale-line',
  demos: {
    WolScaleLineSimpleExampleComponent,
  },
};

export default ScaleLineControlPage;
