import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolStaticImageExampleComponent } from './examples';

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
