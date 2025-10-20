import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolCanvasTilesExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const TileDebugSourcePage: NgDocPage = {
  title: 'TileDebug',
  mdFile: './docs/index.md',
  order: 5,
  category: SourcesCategory,
  route: 'tile-debug',
  demos: {
    WolCanvasTilesExampleComponent,
  },
};

export default TileDebugSourcePage;
