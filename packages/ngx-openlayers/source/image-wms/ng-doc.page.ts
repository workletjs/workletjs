import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import {
  WolImageLoadEventsExampleComponent,
  WolImageWMSCustomProjExampleComponent,
  WolImageWMSGetFeatureInfoExampleComponent,
  WolSingleImageWMSExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const ImageWMSSourcePage: NgDocPage = {
  title: 'ImageWMS',
  mdFile: './docs/index.md',
  order: 25,
  category: SourcesCategory,
  route: 'image-wms',
  demos: {
    WolImageLoadEventsExampleComponent,
    WolImageWMSCustomProjExampleComponent,
    WolImageWMSGetFeatureInfoExampleComponent,
    WolSingleImageWMSExampleComponent,
  },
};

export default ImageWMSSourcePage;
