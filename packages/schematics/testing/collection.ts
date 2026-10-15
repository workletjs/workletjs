import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSchematics } from '../tools/build.mjs';
import { packageSchematics } from '../tools/package.mjs';

/** Exercise compiled, published-style factories without requiring a library build first. */
export function createTestCollection() {
  const packageRoot = mkdtempSync(join(tmpdir(), 'ngx-openlayers-schematics-'));
  const buildRoot = join(packageRoot, 'collection-build');
  const collectionRoot = join(packageRoot, 'schematics');
  buildSchematics(buildRoot);
  writeFileSync(
    join(packageRoot, 'package.json'),
    JSON.stringify({
      name: '@workletjs/ngx-openlayers',
      version: '22.0.1',
      type: 'module',
      peerDependencies: {
        '@angular/core': '~22.2.0',
        '@angular/cdk': '~22.2.0',
        ol: '~10.11.0',
      },
    }),
  );
  packageSchematics(packageRoot, buildRoot);
  rmSync(buildRoot, { recursive: true, force: true });
  symlinkSync(
    fileURLToPath(new URL('../../../node_modules', import.meta.url)),
    join(packageRoot, 'node_modules'),
  );
  const collectionPath = join(collectionRoot, 'collection.json');
  return {
    packageRoot,
    collectionPath,
    runner: new SchematicTestRunner('ngx-openlayers', collectionPath),
    cleanup: () => rmSync(packageRoot, { recursive: true, force: true }),
  };
}
