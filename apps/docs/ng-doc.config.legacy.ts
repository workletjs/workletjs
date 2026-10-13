// The NgDoc configuration of the legacy builders (`build-legacy`, `serve-legacy`), created by
// `ng g @ng-doc/builder:migrate-to-vite`. Their generated files go to `ng-doc-legacy/`, so
// they never share a folder with the Vite engine, which refuses files it didn't write.
import type { NgDocConfiguration } from '@ng-doc/builder';

import config from './ng-doc.config';

const legacyConfig: NgDocConfiguration = { ...config, outDir: 'ng-doc-legacy' };

export default legacyConfig;
