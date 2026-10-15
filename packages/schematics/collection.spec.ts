import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestCollection } from './testing/collection';

describe('published schematics collection', () => {
  let fixture: ReturnType<typeof createTestCollection>;

  beforeAll(() => {
    fixture = createTestCollection();
  });

  afterAll(() => fixture?.cleanup());

  it('exposes only the installation and application commands', () => {
    const collection = JSON.parse(readFileSync(fixture.collectionPath, 'utf8'));
    expect(Object.keys(collection.schematics)).toEqual(['ng-add', 'application']);
    const runner = new SchematicTestRunner('ngx-openlayers', fixture.collectionPath);
    expect(runner.engine.createCollection('ngx-openlayers').listSchematicNames().sort()).toEqual([
      'application',
      'ng-add',
    ]);
  });

  it('loads CommonJS factories from an ESM library package', () => {
    const requireFromLibrary = createRequire(join(fixture.packageRoot, 'package.json'));
    const manifest = requireFromLibrary('./schematics/package.json');
    expect(manifest).toEqual({ type: 'commonjs' });
    expect(requireFromLibrary('./schematics/ng-add/index.js').ngAdd).toBeTypeOf('function');
    expect(requireFromLibrary('./schematics/application/index.js').application).toBeTypeOf(
      'function',
    );
    expect(existsSync(join(fixture.packageRoot, 'schematics/ng-add/schema.d.ts'))).toBe(true);
  });

  it('publishes schemas with native prompts and stable defaults', () => {
    const schema = JSON.parse(
      readFileSync(join(fixture.packageRoot, 'schematics/ng-add/schema.json'), 'utf8'),
    );
    expect(schema.properties.example.default).toBe(false);
    expect(schema.properties.example['x-prompt']).toBeTruthy();
    expect(schema.properties.exampleName.default).toBe('map-example');
    expect(schema.properties.route.default).toBe('map');
  });
});
