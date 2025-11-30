import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolUTFGridExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const UTFGridSourcePage: NgDocPage = {
  title: 'UTFGrid',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'utf-grid',
  demos: {
    WolUTFGridExampleComponent,
  },
};

export default UTFGridSourcePage;
