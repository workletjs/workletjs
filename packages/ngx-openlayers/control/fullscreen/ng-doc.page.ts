import { NgDocPage } from '@ng-doc/core';
import ControlsCategory from '../../ng-doc/controls/ng-doc.category';
import {
  WolFullScreenControlExampleComponent,
  WolFullScreenControlSourceExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const FullscreenControlPage: NgDocPage = {
  title: 'Fullscreen',
  mdFile: './docs/index.md',
  category: ControlsCategory,
  route: 'fullscreen',
  demos: {
    WolFullScreenControlExampleComponent,
    WolFullScreenControlSourceExampleComponent,
  },
};

export default FullscreenControlPage;
