import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootRequire = createRequire(import.meta.url);
const docsRequire = createRequire(
  fileURLToPath(new URL('../apps/docs/package.json', import.meta.url)),
);

test('the workspace and docs app resolve one @ng-doc/app instance', () => {
  assert.equal(
    docsRequire.resolve('@ng-doc/app/package.json'),
    rootRequire.resolve('@ng-doc/app/package.json'),
  );
});
