import { NgDocConfiguration } from '@ng-doc/builder';
import { ngKeywordsLoader } from '@ng-doc/keywords-loaders';

const config: NgDocConfiguration = {
  docsPath: 'packages/ngx-openlayers',
  keywords: {
    loaders: [ngKeywordsLoader({})],
  },
  repoConfig: {
    url: 'https://github.com/workletjs/workletjs',
    mainBranch: 'main',
    releaseBranch: 'release',
    platform: 'github',
  },
  guide: {},
};

export default config;
