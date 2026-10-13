import nx from '@nx/eslint-plugin';

import baseConfig from '../../eslint.config.mjs';

const moduleBoundaryOptions = baseConfig.findLast(
  (config) => config.rules?.['@nx/enforce-module-boundaries'],
).rules['@nx/enforce-module-boundaries'][1];

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          ...moduleBoundaryOptions,
          // NgDoc generates this application alias outside the docs project root.
          allow: [...moduleBoundaryOptions.allow, '^@ng-doc/generated(?:/.+)?$'],
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      // Newly enabled by the Angular ESLint preset; was not enforced before the upgrade.
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
