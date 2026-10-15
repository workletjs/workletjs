import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolGeoZarrSourceExampleComponent } from './examples';

/**
 * @status:warning EXPERIMENTAL
 */
const GeoZarrSourcePage: NgDocPage = {
  title: 'GeoZarr',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'geozarr',
  demos: {
    WolGeoZarrSourceExampleComponent,
  },
};

export default GeoZarrSourcePage;
