import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import {
  WolImageTileXYZEsriExampleComponent,
  WolImageTileXYZExampleComponent,
  WolImageTileXYZRetinaExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const ImageTileSourcePage: NgDocPage = {
  title: 'ImageTile',
  mdFile: './docs/index.md',
  order: 4,
  category: SourcesCategory,
  route: 'image-tile',
  demos: {
    WolImageTileXYZEsriExampleComponent,
    WolImageTileXYZExampleComponent,
    WolImageTileXYZRetinaExampleComponent,
  },
};

export default ImageTileSourcePage;
