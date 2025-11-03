import { NgDocPage } from '@ng-doc/core';
import GeneralCategory from '../ng-doc.category';
import { WolOverlayExampleComponent, WolPopupExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const OverlayPage: NgDocPage = {
  title: 'Overlay',
  mdFile: './docs/index.md',
  category: GeneralCategory,
  route: 'overlay',
  demos: {
    WolOverlayExampleComponent,
    WolPopupExampleComponent,
  },
};

export default OverlayPage;
