import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolAzureMapsExampleComponent } from './examples';

const AzureMapsSourcePage: NgDocPage = {
  title: 'Azure Maps',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'azure-maps',
  demos: {
    WolAzureMapsExampleComponent,
  },
};

export default AzureMapsSourcePage;
