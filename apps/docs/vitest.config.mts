/// <reference types='vitest' />
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import { angularVitestPlugin } from '../../tools/testing/angular-vitest-plugin';

export default defineConfig(() => ({
  root: import.meta.dirname,
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
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/docs',
      provider: 'v8' as const,
      include: ['src/**/*.ts'],
    },
  },
}));
