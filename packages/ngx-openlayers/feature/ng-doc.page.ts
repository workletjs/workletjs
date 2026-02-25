import { NgDocPage } from '@ng-doc/core';

import GeneralCategory from '../ng-doc/general/ng-doc.category';

/**
 * @status:info NEW
 */
const FeaturePage: NgDocPage = {
  title: 'Feature',
  mdFile: './docs/index.md',
  category: GeneralCategory,
  route: 'feature',
  demos: {},
};

export default FeaturePage;
