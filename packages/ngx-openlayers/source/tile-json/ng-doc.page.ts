import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolTileJSONSourceExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const TileJSONSourcePage: NgDocPage = {
  title: 'TileJSON',
  mdFile: './docs/index.md',
  order: 1,
  category: SourcesCategory,
  route: 'tile-json',
  demos: {
    WolTileJSONSourceExampleComponent,
  },
};

export default TileJSONSourcePage;
