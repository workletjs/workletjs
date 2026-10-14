import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import {
  WolImageTileXYZEsriExampleComponent,
  WolImageTileXYZExampleComponent,
  WolImageTileXYZRetinaExampleComponent,
} from './examples';

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
