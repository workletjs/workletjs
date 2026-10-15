import { schema as jsonSchema } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createTestCollection } from '../testing/collection';

const angularVersion = '~22.2.0';

function application(styles: unknown[] = ['src/styles.css']) {
  return {
    projectType: 'application',
    root: 'projects/app',
    architect: {
      build: {
        builder: '@angular/build:application',
        options: { browser: 'projects/app/src/main.ts', styles },
        configurations: {
          development: {},
          production: { styles: ['src/production.css'] },
        },
      },
      test: { builder: '@angular/build:unit-test', options: {} },
    },
  };
}

function workspace(
  projects: Record<string, unknown> = { app: application() },
  manifest: Record<string, unknown> = { dependencies: { '@angular/core': angularVersion } },
) {
  const tree = Tree.empty();
  tree.create('/angular.json', JSON.stringify({ version: 1, projects }));
  tree.create('/package.json', JSON.stringify({ name: 'consumer', ...manifest }));
  return tree;
}

function readJson(tree: Tree, path: string) {
  return JSON.parse(tree.readText(path));
}

describe('ng-add published command', () => {
  let fixture: ReturnType<typeof createTestCollection>;
  let runner: SchematicTestRunner;

  beforeAll(() => {
    fixture = createTestCollection();
  });
  afterAll(() => fixture?.cleanup());

  const run = (options: object, tree = workspace()) => {
    runner = new SchematicTestRunner('ngx-openlayers', fixture.collectionPath);
    return runner.runSchematic('ng-add', options, tree);
  };

  it('defaults to dependency and style setup without requiring router or standalone', async () => {
    const result = await run({});
    expect(readJson(result, '/package.json').dependencies).toEqual({
      '@angular/core': angularVersion,
      '@angular/cdk': angularVersion,
      ol: '~10.11.0',
    });
    expect(result.files.sort()).toEqual(['/angular.json', '/package.json']);
    expect(readJson(result, '/angular.json').projects.app.architect.build.options.styles).toEqual([
      'node_modules/ol/ol.css',
      'src/styles.css',
    ]);
    expect(runner.tasks.map((task) => task.name)).toEqual(['node-package']);
  });

  it('honors explicit false and skipInstall', async () => {
    await run({ example: false, skipInstall: true });
    expect(runner.tasks).toEqual([]);
  });

  it('does not silently ignore an explicitly requested example before its implementation', async () => {
    await expect(run({ example: true })).rejects.toThrow(/map example/i);
  });

  it('selects the explicit application without changing other applications', async () => {
    const result = await run(
      { project: 'second' },
      workspace({ first: application(), second: application() }),
    );
    const projects = readJson(result, '/angular.json').projects;
    expect(projects.first.architect.build.options.styles).toEqual(['src/styles.css']);
    expect(projects.second.architect.build.options.styles[0]).toBe('node_modules/ol/ol.css');
  });

  it('selects the only application while ignoring library projects', async () => {
    await expect(
      run({}, workspace({ library: { projectType: 'library', root: 'lib' }, app: application() })),
    ).resolves.toBeDefined();
  });

  it('reports all application candidates when the target is ambiguous', async () => {
    await expect(run({}, workspace({ beta: application(), alpha: application() }))).rejects.toThrow(
      /--project.*alpha.*beta/,
    );
  });

  it.each([
    ['unknown', /does not exist/],
    ['library', /must be an application/],
  ])('rejects invalid target %s', async (project, error) => {
    await expect(
      run(
        { project },
        workspace({ app: application(), library: { projectType: 'library', root: '' } }),
      ),
    ).rejects.toThrow(error);
  });

  it('rejects workspaces without an application', async () => {
    await expect(run({}, workspace({}))).rejects.toThrow(/application/);
  });

  it('preserves compatible declarations and their dependency sections', async () => {
    const manifest = {
      dependencies: { '@angular/core': '^22.2.0', ol: '^10.11.0' },
      devDependencies: { '@angular/cdk': '22.2.2' },
    };
    const result = await run({}, workspace(undefined, manifest));
    expect(readJson(result, '/package.json')).toEqual({ name: 'consumer', ...manifest });
    expect(runner.tasks).toEqual([]);
  });

  it.each([
    ['@angular/core', '~21.0.0', '~22.2.0'],
    ['@angular/cdk', '^21.0.0', '~22.2.0'],
    ['ol', '~9.0.0', '~10.11.0'],
  ])('rejects incompatible %s before changing the Tree', async (name, declared, required) => {
    const tree = workspace(undefined, {
      dependencies: { '@angular/core': angularVersion, [name]: declared },
    });
    const original = tree.readText('/angular.json');
    await expect(run({}, tree)).rejects.toThrow(
      new RegExp(
        `${name.replace('/', '\\/')}.*${declared.replaceAll('.', '\\.').replaceAll('^', '\\^')}.*${required.replaceAll('.', '\\.')}`,
      ),
    );
    expect(tree.readText('/angular.json')).toBe(original);
    expect(readJson(tree, '/package.json').dependencies[name]).toBe(declared);
  });

  it('requires Angular core instead of installing Angular into an invalid host', async () => {
    await expect(run({}, workspace(undefined, { dependencies: {} }))).rejects.toThrow(
      /@angular\/core.*missing/i,
    );
  });

  it('uses this installed library release metadata instead of hardcoded peer ranges', async () => {
    const path = join(fixture.packageRoot, 'package.json');
    const original = readFileSync(path, 'utf8');
    const manifest = JSON.parse(original);
    manifest.peerDependencies = {
      '@angular/core': '~23.0.0',
      '@angular/cdk': '~23.0.0',
      ol: '~11.0.0',
    };
    try {
      writeFileSync(path, JSON.stringify(manifest));
      const result = await run(
        {},
        workspace(undefined, { dependencies: { '@angular/core': '~23.0.0' } }),
      );
      expect(readJson(result, '/package.json').dependencies).toEqual(manifest.peerDependencies);
      manifest.peerDependencies.ol = 'catalog:';
      writeFileSync(path, JSON.stringify(manifest));
      await expect(run({})).rejects.toThrow(/resolved peer dependency range for ol/);
    } finally {
      writeFileSync(path, original);
    }
  });

  it('validates duplicate declarations rather than overwriting their source', async () => {
    await expect(
      run(
        {},
        workspace(undefined, {
          dependencies: { '@angular/core': angularVersion, '@angular/cdk': angularVersion },
          devDependencies: { '@angular/cdk': '~21.0.0' },
        }),
      ),
    ).rejects.toThrow(/@angular\/cdk.*~21.0.0.*~22.2.0/);
  });

  it('preserves compatible optional dependency declarations', async () => {
    const result = await run(
      {},
      workspace(undefined, {
        dependencies: { '@angular/core': angularVersion },
        optionalDependencies: { ol: '^10.11.0' },
      }),
    );
    const manifest = readJson(result, '/package.json');
    expect(manifest.optionalDependencies.ol).toBe('^10.11.0');
    expect(manifest.dependencies.ol).toBeUndefined();
  });

  it('checks installed versions as well as intersecting declared ranges', async () => {
    const tree = workspace(undefined, { dependencies: { '@angular/core': '^22.0.0' } });
    tree.create('/node_modules/@angular/core/package.json', JSON.stringify({ version: '22.0.7' }));
    await expect(run({}, tree)).rejects.toThrow(/@angular\/core.*\^22.0.0.*22.0.7.*~22.2.0/);
  });

  it.each(['file:../angular-core', 'workspace:*', 'latest', 'github:angular/angular'])(
    'preserves non-semver %s when the installed version is compatible',
    async (declaration) => {
      const tree = workspace(undefined, { devDependencies: { '@angular/core': declaration } });
      tree.create(
        '/node_modules/@angular/core/package.json',
        JSON.stringify({ version: '22.2.2' }),
      );
      const result = await run({}, tree);
      expect(readJson(result, '/package.json').devDependencies['@angular/core']).toBe(declaration);
    },
  );

  it('explains how to verify a non-semver declaration without an installed version', async () => {
    await expect(
      run({}, workspace(undefined, { dependencies: { '@angular/core': 'workspace:*' } })),
    ).rejects.toThrow(/@angular\/core.*workspace:\*.*install.*~22.2.0/i);
  });

  it('rejects an incompatible installed peer even when its declaration is missing', async () => {
    const tree = workspace();
    tree.create('/node_modules/ol/package.json', JSON.stringify({ version: '9.0.0' }));
    await expect(run({}, tree)).rejects.toThrow(/ol.*9.0.0.*~10.11.0/);
  });

  it('deduplicates string and object styles while preserving user style order and options', async () => {
    const tree = workspace({
      app: application([
        'src/reset.css',
        { input: './node_modules/ol/ol.css', bundleName: 'maps', inject: true },
        'node_modules/ol/ol.css',
        'src/styles.css',
      ]),
    });
    const result = await run({}, tree);
    const target = readJson(result, '/angular.json').projects.app.architect.build;
    expect(target.options.styles).toEqual([
      'src/reset.css',
      { input: './node_modules/ol/ol.css', bundleName: 'maps', inject: true },
      'src/styles.css',
    ]);
    expect(target.configurations.production.styles).toEqual([
      'node_modules/ol/ol.css',
      'src/production.css',
    ]);
    expect(target.configurations.development.styles).toBeUndefined();
    expect(readJson(result, '/angular.json').projects.app.architect.test.options).toEqual({});
  });

  it('creates build options styles when absent', async () => {
    const app = application();
    delete (app.architect.build.options as { styles?: unknown[] }).styles;
    const result = await run({}, workspace({ app }));
    expect(readJson(result, '/angular.json').projects.app.architect.build.options.styles).toEqual([
      'node_modules/ol/ol.css',
    ]);
  });

  it('is idempotent and does not request another install after dependencies are declared', async () => {
    const once = await run({});
    const twice = await run({}, once);
    expect(twice.readText('/angular.json')).toBe(once.readText('/angular.json'));
    expect(twice.readText('/package.json')).toBe(once.readText('/package.json'));
    expect(runner.tasks).toEqual([]);
  });

  it('validates the build target before adding dependencies', async () => {
    const app = application();
    delete (app.architect as { build?: unknown }).build;
    const tree = workspace({ app });
    const original = tree.readText('/package.json');
    await expect(run({}, tree)).rejects.toThrow(/build target/);
    expect(tree.readText('/package.json')).toBe(original);
  });

  it('rejects invalid styles before making dependency or workspace writes', async () => {
    const app = application();
    (app.architect.build.options as { styles: unknown }).styles = 'src/styles.css';
    const tree = workspace({ app });
    const originalWorkspace = tree.readText('/angular.json');
    const originalManifest = tree.readText('/package.json');
    await expect(run({}, tree)).rejects.toThrow(/styles must be an array/);
    expect(tree.readText('/angular.json')).toBe(originalWorkspace);
    expect(tree.readText('/package.json')).toBe(originalManifest);
  });

  it('uses native schema prompts and the CLI current-project smart default', async () => {
    const schema = JSON.parse(
      readFileSync(join(fixture.packageRoot, 'schematics/ng-add/schema.json'), 'utf8'),
    );
    const registry = new jsonSchema.CoreSchemaRegistry();
    registry.addPostTransform(jsonSchema.transforms.addUndefinedDefaults);
    registry.addSmartDefaultProvider('projectName', () => 'second');
    const prompts = vi.fn<jsonSchema.PromptProvider>(async () => ({
      '/example': false,
    }));
    registry.usePromptProvider(prompts);
    const validate = await registry.compile(schema);
    const validated = await validate({});
    expect(validated.success).toBe(true);
    expect(prompts.mock.calls[0][0]).toMatchObject([
      { id: '/example', type: 'confirmation', default: false },
    ]);
    const result = await run(
      validated.data as object,
      workspace({ first: application(), second: application() }),
    );
    expect(
      readJson(result, '/angular.json').projects.second.architect.build.options.styles[0],
    ).toBe('node_modules/ol/ol.css');
    prompts.mockClear();
    await validate({ example: false });
    expect(prompts).not.toHaveBeenCalled();
  });
});
