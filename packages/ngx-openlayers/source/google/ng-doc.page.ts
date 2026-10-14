import { NgDocPage } from '@ng-doc/core';

import SourcesCategory from '../../ng-doc/sources/ng-doc.category';
import { WolGoogleMapsExampleComponent } from './examples';

const GoogleSourcePage: NgDocPage = {
  title: 'Google',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'google',
  demos: {
    WolGoogleMapsExampleComponent,
  },
};

export default GoogleSourcePage;
