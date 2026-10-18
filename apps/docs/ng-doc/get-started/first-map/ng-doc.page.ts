import { NgDocPage } from '@ng-doc/core';

import Category from '../ng-doc.category';
import { FirstMapExampleComponent } from './examples/first-map-example.component';

const Page: NgDocPage = {
  title: 'First Map',
  mdFile: './index.md',
  category: Category,
  route: 'first-map',
  order: 3,
  demos: { FirstMapExampleComponent },
};

export default Page;
