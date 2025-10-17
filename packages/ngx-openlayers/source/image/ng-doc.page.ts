import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolMapServerWMSExampleComponent, WolWMSImageSVGExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const ImageSourcePage: NgDocPage = {
  title: 'Image',
  mdFile: './docs/index.md',
  order: 20,
  category: SourcesCategory,
  route: 'image',
  demos: {
    WolMapServerWMSExampleComponent,
    WolWMSImageSVGExampleComponent,
  },
};

export default ImageSourcePage;
