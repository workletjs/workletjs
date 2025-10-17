import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolMapGuideUntiledExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ImageMapGuideSourcePage: NgDocPage = {
  title: 'ImageMapGuide',
  mdFile: './docs/index.md',
  order: 23,
  category: SourcesCategory,
  route: 'image-map-guide',
  demos: {
    WolMapGuideUntiledExampleComponent,
  },
};

export default ImageMapGuideSourcePage;
