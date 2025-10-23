import { NgDocPage } from '@ng-doc/core';
import SourcesCategory from '../ng-doc.category';
import {
  WolSentinelHubDatePickerExampleComponent,
  WolSentinelHubExampleComponent,
} from './examples';

/**
 * @status:info NEW
 */
const SentinelHubSourcePage: NgDocPage = {
  title: 'SentinelHub',
  mdFile: './docs/index.md',
  category: SourcesCategory,
  route: 'sentinel-hub',
  demos: {
    WolSentinelHubDatePickerExampleComponent,
    WolSentinelHubExampleComponent,
  },
};

export default SentinelHubSourcePage;
