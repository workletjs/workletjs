import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolSeaLevelExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const RasterSourcePage: NgDocPage = {
  title: 'Raster',
  mdFile: './docs/index.md',
  order: 26,
  category: SourcesCategory,
  route: 'raster',
  demos: {
    WolSeaLevelExampleComponent,
  },
};

export default RasterSourcePage;
