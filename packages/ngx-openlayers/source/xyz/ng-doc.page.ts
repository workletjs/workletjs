import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolXYZSourceExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const XYZSourcePage: NgDocPage = {
  title: 'XYZ',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'xyz',
  demos: {
    WolXYZSourceExampleComponent,
  },
};

export default XYZSourcePage;
