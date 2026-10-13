import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootRequire = createRequire(import.meta.url);
const docsRequire = createRequire(
  fileURLToPath(new URL('../apps/docs/package.json', import.meta.url)),
);
const testingRequire = createRequire(
  new URL('../tools/testing/angular-vitest-plugin.ts', import.meta.url),
);

function packageVersion(requireFrom, packageName) {
  return requireFrom(`${packageName}/package.json`).version;
}

function dependencyRequire(requireFrom, packageName) {
  return createRequire(requireFrom.resolve(`${packageName}/package.json`));
}

test('the workspace and docs app resolve one @ng-doc/app instance', () => {
  assert.equal(
    docsRequire.resolve('@ng-doc/app/package.json'),
    rootRequire.resolve('@ng-doc/app/package.json'),
  );
});

test('NgDoc generation and application packages share the same installed release', () => {
  const appVersion = packageVersion(rootRequire, '@ng-doc/app');

  for (const packageName of ['@ng-doc/core', '@ng-doc/ui-kit']) {
    assert.equal(packageVersion(rootRequire, packageName), appVersion);
  }
  for (const packageName of ['@ng-doc/builder', '@ng-doc/keywords-loaders']) {
    assert.equal(packageVersion(docsRequire, packageName), appVersion);
  }
});

test('the NgDoc builder runs on the documentation Vite 8.3+ instance', () => {
  const builderRequire = dependencyRequire(docsRequire, '@ng-doc/builder');
  const [major, minor] = packageVersion(builderRequire, 'vite').split('.').map(Number);

  assert.equal(major, 8);
  assert.ok(minor >= 3);
  assert.equal(
    builderRequire.resolve('vite/package.json'),
    docsRequire.resolve('vite/package.json'),
  );
});

test('Angular tests and Vitest retain their Vite 7 compilation context', () => {
  const angularRequire = dependencyRequire(testingRequire, '@analogjs/vite-plugin-angular');
  const vitestRequire = dependencyRequire(rootRequire, 'vitest');

  assert.equal(packageVersion(angularRequire, 'vite').split('.')[0], '7');
  assert.equal(packageVersion(vitestRequire, 'vite').split('.')[0], '7');
  assert.notEqual(
    angularRequire.resolve('vite/package.json'),
    docsRequire.resolve('vite/package.json'),
  );
});
