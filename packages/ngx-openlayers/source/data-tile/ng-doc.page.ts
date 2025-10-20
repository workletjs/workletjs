import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import { WolDataTilesExampleComponent, WolPMTilesShadedReliefExampleComponent } from './examples';

/**
 * @status:info NEW
 */
const DataTileSourcePage: NgDocPage = {
  title: 'DataTile',
  mdFile: './docs/index.md',
  order: 2,
  category: SourcesCategory,
  route: 'data-tile',
  demos: {
    WolDataTilesExampleComponent,
    WolPMTilesShadedReliefExampleComponent,
  },
};

export default DataTileSourcePage;
