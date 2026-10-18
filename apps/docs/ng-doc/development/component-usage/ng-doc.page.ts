import { NgDocPage } from '@ng-doc/core';

import Category from '../ng-doc.category';
import { ComponentUsageExampleComponent } from './examples/component-usage-example.component';

const Page: NgDocPage = {
  title: 'Component Usage',
  mdFile: './index.md',
  category: Category,
  route: 'component-usage',
  order: 1,
  demos: { ComponentUsageExampleComponent },
};

export default Page;
