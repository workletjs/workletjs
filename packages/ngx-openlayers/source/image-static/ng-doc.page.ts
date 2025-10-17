import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolStaticImageExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ImageStaticSourcePage: NgDocPage = {
  title: 'ImageStatic',
  mdFile: './docs/index.md',
  order: 24,
  category: SourcesCategory,
  route: 'image-static',
  demos: {
    WolStaticImageExampleComponent,
  },
};

export default ImageStaticSourcePage;
