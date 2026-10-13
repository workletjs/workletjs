import type { NgDocConfiguration } from '@ng-doc/builder';

import config from './ng-doc.config';

// The Vite engine supports multiple roots; NgDoc 22.1's shared type still declares a string.
type ViteNgDocConfiguration = Omit<NgDocConfiguration, 'docsPath'> & {
  docsPath: string[];
};

export default {
  ...config,
  docsPath: ['apps/docs/ng-doc', 'packages/ngx-openlayers'],
} satisfies ViteNgDocConfiguration;
