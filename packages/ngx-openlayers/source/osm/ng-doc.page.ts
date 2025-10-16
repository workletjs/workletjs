import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';

/**
 * @status:info NEW
 */
const OSMSourcePage: NgDocPage = {
  title: 'OSM',
  mdFile: './docs/index.md',
  order: 1,
  category: SourcesCategory,
  route: 'osm',
  demos: {},
};

export default OSMSourcePage;
