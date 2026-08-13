import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const rootRequire = createRequire(import.meta.url);
const docsRequire = createRequire(pathToFileURL(`${process.cwd()}/apps/docs/package.json`));

test('the workspace and docs app resolve one @ng-doc/app instance', () => {
  assert.equal(
    docsRequire.resolve('@ng-doc/app/package.json'),
    rootRequire.resolve('@ng-doc/app/package.json'),
  );
});
