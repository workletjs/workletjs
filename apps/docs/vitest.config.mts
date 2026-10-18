/// <reference types='vitest' />
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import { angularVitestPlugin } from '../../tools/testing/angular-vitest-plugin';

export default defineConfig(() => ({
  root: import.meta.dirname,
  resolve: {
    alias: [
      {
        find: /^@ng-doc\/generated$/,
        replacement: fileURLToPath(new URL('./src/testing/ng-doc-generated.ts', import.meta.url)),
      },
    ],
  },
  cacheDir: '../../node_modules/.vite/apps/docs',
  plugins: [angularVitestPlugin(), tsconfigPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [tsconfigPaths()],
  // },
  test: {
    name: 'docs',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'ng-doc/**/examples/**/*.spec.ts',
    ],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/docs',
      provider: 'v8' as const,
      include: ['src/**/*.ts'],
    },
  },
}));
