import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/schematics',
  test: {
    name: 'schematics',
    environment: 'node',
    include: ['**/*.spec.ts'],
    watch: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      reportsDirectory: '../../coverage/packages/schematics',
      provider: 'v8',
    },
  },
});
