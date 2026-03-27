import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'apps/**/vite.config.{mjs,js,ts,mts}',
      'packages/**/vite.config.{mjs,js,ts,mts}',
      'apps/**/vitest.config.{mjs,js,ts,mts}',
      'packages/**/vitest.config.{mjs,js,ts,mts}',
    ],
  },
});
