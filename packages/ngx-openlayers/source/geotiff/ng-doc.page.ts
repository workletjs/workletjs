import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import {
  WolCOGBlobExampleComponent,
  WolCOGMathMultiSourceExampleComponent,
  WolCloudOptimizedGeoTIFFExampleComponent,
  WolGeoTIFFReprojectionExampleComponent,
  WolGeoTIFFWithOverviewsExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const GeoTIFFSourcePage: NgDocPage = {
  title: 'GeoTIFF',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'geotiff',
  demos: {
    WolCloudOptimizedGeoTIFFExampleComponent,
    WolCOGBlobExampleComponent,
    WolCOGMathMultiSourceExampleComponent,
    WolGeoTIFFReprojectionExampleComponent,
    WolGeoTIFFWithOverviewsExampleComponent,
  },
};

export default GeoTIFFSourcePage;
