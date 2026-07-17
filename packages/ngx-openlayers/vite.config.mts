/// <reference types='vitest' />
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/ngx-openlayers',
  plugins: [angular({ tsconfig: resolve(__dirname, 'tsconfig.spec.json') }), tsconfigPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [tsconfigPaths()],
  // },
  test: {
    name: 'ngx-openlayers',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/ngx-openlayers',
      provider: 'v8' as const,
      include: ['**/*.ts'],
    },
  },
}));
