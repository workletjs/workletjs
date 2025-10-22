import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import {
  WolCloudOptimizedGeoTIFFExampleComponent,
  WolCOGBlobExampleComponent,
  WolCOGMathMultiSourceExampleComponent,
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
