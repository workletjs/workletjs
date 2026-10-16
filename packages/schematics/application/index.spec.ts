import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestCollection } from '../testing/collection';

const require = createRequire(import.meta.url);
const angularManifestPath = require.resolve('@schematics/angular/package.json');
const angularCollection = join(
  dirname(angularManifestPath),
  JSON.parse(readFileSync(angularManifestPath, 'utf8')).schematics,
);

async function workspace(newProjectRoot = 'projects') {
  return new SchematicTestRunner('angular', angularCollection).runSchematic('workspace', {
    name: 'consumer',
    version: '22.2.2',
    newProjectRoot,
  });
}

function snapshot(tree: Tree): Record<string, string> {
  const result: Record<string, string> = {};
  tree.visit((path) => (result[path] = tree.read(path)?.toString('base64') ?? ''));
  return result;
}

function manifest(tree: Tree) {
  return JSON.parse(tree.readText('/package.json'));
}

function project(tree: Tree, name = 'maps') {
  return JSON.parse(tree.readText('/angular.json')).projects[name];
}

function routeObjects(tree: Tree, file = '/projects/maps/src/app/app.routes.ts') {
  const source = ts.createSourceFile(file, tree.readText(file), ts.ScriptTarget.Latest, true);
  const statement = source.statements.find(ts.isVariableStatement);
  const initializer = statement?.declarationList.declarations[0].initializer;
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    throw new Error('Expected generated root routes to be a static array');
  }
  return initializer.elements.map((element) => element.getText(source));
}

describe('application through the published collection', () => {
  let fixture: ReturnType<typeof createTestCollection>;
  let runner: SchematicTestRunner;

  beforeAll(() => (fixture = createTestCollection()));
  afterAll(() => fixture?.cleanup());

  async function run(options: object = {}, tree?: Tree) {
    runner = new SchematicTestRunner('ngx-openlayers', fixture.collectionPath);
    return runner.runSchematic(
      'application',
      { name: 'maps', ...options },
      tree ?? (await workspace()),
    );
  }

  it('generates a complete modern Angular map application', async () => {
    const result = await run();
    const app = project(result);
    expect(app.projectType).toBe('application');
    expect(app.root).toBe('projects/maps');
    expect(app.architect.build.builder).toBe('@angular/build:application');
    expect(app.architect.build.options.styles).toEqual([
      'node_modules/ol/ol.css',
      'projects/maps/src/styles.css',
    ]);
    expect(app.architect.build.options.polyfills).toBeUndefined();
    expect(app.architect.build.options.server).toBeUndefined();
    expect(app.architect.build.options.ssr).toBeUndefined();
    expect(app.architect.test.builder).toBe('@angular/build:unit-test');
    expect(app.architect.test.options?.styles).toBeUndefined();
    expect(result.exists('/projects/maps/tsconfig.app.json')).toBe(true);
    expect(result.exists('/projects/maps/tsconfig.spec.json')).toBe(true);
    expect(result.exists('/projects/maps/src/styles.css')).toBe(true);
    expect(result.files.some((path) => /server|app\.module|\.scss$|karma/.test(path))).toBe(false);
    expect(result.readText('/projects/maps/src/main.ts')).toContain(
      'bootstrapApplication(App, appConfig)',
    );
    const component = result.readText('/projects/maps/src/app/map-example/map-example.ts');
    expect(component).toContain("from '@workletjs/ngx-openlayers/map'");
    expect(component).toContain('export class MapExample');
    expect(component).not.toContain('standalone: true');
    expect(manifest(result).dependencies['@angular/cdk']).toBe('~22.2.0');
    expect(manifest(result).dependencies.ol).toBe('~10.11.0');
    expect(manifest(result).devDependencies.vitest).toBeDefined();
    expect(manifest(result).devDependencies.jsdom).toBeDefined();
    expect(manifest(result).devDependencies['@angular/build']).toBeDefined();
    expect(runner.tasks.map((task) => task.name)).toEqual(['node-package']);
  });

  it('keeps the shared lazy map route first and adds an exact homepage redirect', async () => {
    const result = await run();
    const routes = routeObjects(result);
    expect(routes).toHaveLength(2);
    expect(routes[0]).toContain("path: 'map'");
    expect(routes[0]).toContain("import('./map-example/map-example')");
    expect(routes[0]).toContain('m.MapExample');
    expect(routes[1]).toMatch(/path:\s*''/);
    expect(routes[1]).toMatch(/pathMatch:\s*'full'/);
    expect(routes[1]).toMatch(/redirectTo:\s*'map'/);
  });

  it('replaces the welcome UI and its default test with a real router outlet test', async () => {
    const result = await run();
    const root = '/projects/maps/src/app/app';
    expect(result.readText(`${root}.html`).trim()).toBe('<router-outlet />');
    const source = result.readText(`${root}.ts`);
    expect(source).toContain('RouterOutlet');
    expect(source).not.toContain('signal');
    expect(source).not.toContain('title');
    const spec = result.readText(`${root}.spec.ts`);
    expect(spec).toContain('provideRouter([])');
    expect(spec).toContain("querySelector('router-outlet')");
    expect(spec).not.toContain('Hello,');
    expect(spec).not.toContain("querySelector('h1')");
    expect(spec).not.toContain('./app.routes');
    const mapSpec = result.readText('/projects/maps/src/app/map-example/map-example.spec.ts');
    expect(mapSpec).toContain('overrideComponent(MapExample');
    expect(mapSpec).toContain('getComputedStyle(map).height');
  });

  it('supports a custom project root, example name and map path together', async () => {
    const result = await run({
      name: 'dashboard',
      projectRoot: 'apps/customer-maps',
      exampleName: 'world-map',
      route: 'explore',
    });
    expect(project(result, 'dashboard').root).toBe('apps/customer-maps');
    const root = '/apps/customer-maps/src/app';
    expect(result.exists(`${root}/world-map/world-map.ts`)).toBe(true);
    expect(result.readText(`${root}/world-map/world-map.ts`)).toContain('export class WorldMap');
    expect(result.readText(`${root}/world-map/world-map.spec.ts`)).toContain(
      'overrideComponent(WorldMap',
    );
    const routes = routeObjects(result, `${root}/app.routes.ts`);
    expect(routes[0]).toContain("path: 'explore'");
    expect(routes[0]).toContain("import('./world-map/world-map')");
    expect(routes[1]).toMatch(/redirectTo:\s*'explore'/);
    expect(result.exists('/projects/dashboard/src/main.ts')).toBe(false);
  });

  it('honors the workspace new-project root instead of assuming projects', async () => {
    const result = await run({}, await workspace('clients'));
    expect(project(result).root).toBe('clients/maps');
    expect(result.exists('/clients/maps/src/app/map-example/map-example.ts')).toBe(true);
  });

  it('supports an empty workspace new-project root and root-level application', async () => {
    const result = await run({ projectRoot: '' }, await workspace(''));
    expect(project(result).root).toBe('');
    expect(result.exists('/src/app/map-example/map-example.ts')).toBe(true);
    expect(result.readText('/src/app/app.html').trim()).toBe('<router-outlet />');
  });

  it.each([
    ['MapApp', 'map-app'],
    ['@demo/MapApp', 'demo/map-app'],
  ])(
    'preserves the official project key %s while deriving the directory %s',
    async (name, directory) => {
      const result = await run({ name });
      expect(project(result, name).root).toBe(`projects/${directory}`);
      expect(result.exists(`/projects/${directory}/src/app/map-example/map-example.ts`)).toBe(true);
    },
  );

  it('does not schedule installation when skipInstall is set', async () => {
    await run({ skipInstall: true });
    expect(runner.tasks).toEqual([]);
  });

  it('still schedules one outer install when compatible peers already exist', async () => {
    const tree = await workspace();
    const pkg = manifest(tree);
    pkg.dependencies['@angular/cdk'] = '^22.2.0';
    pkg.dependencies.ol = '^10.11.0';
    tree.overwrite('/package.json', JSON.stringify(pkg));
    const result = await run({}, tree);
    expect(manifest(result).dependencies['@angular/cdk']).toBe('^22.2.0');
    expect(manifest(result).dependencies.ol).toBe('^10.11.0');
    expect(runner.tasks.map((task) => task.name)).toEqual(['node-package']);
  });

  it('preserves existing applications, workspace defaults and dependency sources', async () => {
    const tree = await workspace();
    const config = JSON.parse(tree.readText('/angular.json'));
    config.projects.existing = {
      projectType: 'application',
      root: 'existing',
      sourceRoot: 'existing/src',
      architect: {
        build: { builder: '@angular/build:application', options: { styles: ['custom.css'] } },
      },
    };
    config.schematics = {
      '@schematics/angular:application': {
        style: 'scss',
        routing: false,
        standalone: false,
        zoneless: false,
        testRunner: 'karma',
        skipTests: true,
        minimal: true,
        ssr: true,
      },
    };
    tree.overwrite('/angular.json', JSON.stringify(config));
    const originalApp = config.projects.existing;
    const result = await run({}, tree);
    expect(project(result, 'existing')).toEqual(originalApp);
    expect(JSON.parse(result.readText('/angular.json')).schematics).toEqual(config.schematics);
    expect(result.readText('/projects/maps/src/app/app.config.ts')).toContain(
      'provideRouter(routes)',
    );
    expect(result.exists('/projects/maps/src/app/app.spec.ts')).toBe(true);
    expect(project(result).architect.test.builder).toBe('@angular/build:unit-test');
  });

  it.each([
    { exampleName: '../unsafe' },
    { exampleName: 'MapExample' },
    { route: 'maps/world' },
    { route: ':map' },
  ])('rejects invalid shared map parameters atomically: %j', async (options) => {
    const tree = await workspace();
    const before = snapshot(tree);
    await expect(run(options, tree)).rejects.toThrow(/lowercase kebab-case/);
    expect(snapshot(tree)).toEqual(before);
    expect(runner.tasks).toEqual([]);
  });

  it('rolls back the official application generation when peer validation fails', async () => {
    const tree = await workspace();
    const pkg = manifest(tree);
    pkg.dependencies['@angular/core'] = '~21.0.0';
    tree.overwrite('/package.json', JSON.stringify(pkg));
    const before = snapshot(tree);
    await expect(run({}, tree)).rejects.toThrow(/@angular\/core.*~21.0.0.*~22.2.0/);
    expect(snapshot(tree)).toEqual(before);
    expect(runner.tasks).toEqual([]);
  });

  it('rolls back application and dependency additions on an existing map component conflict', async () => {
    const tree = await workspace();
    tree.create('/projects/maps/src/app/map-example/map-example.ts', '// existing business code');
    const before = snapshot(tree);
    await expect(run({}, tree)).rejects.toThrow(/component file conflict/);
    expect(snapshot(tree)).toEqual(before);
    expect(runner.tasks).toEqual([]);
  });

  it('protects pre-existing application templates even when the official generator could overwrite them', async () => {
    const tree = await workspace();
    tree.create('/projects/maps/src/app/app.html', '<p>Business UI</p>');
    const before = snapshot(tree);
    await expect(run({}, tree)).rejects.toThrow(/app.html/);
    expect(snapshot(tree)).toEqual(before);
    expect(runner.tasks).toEqual([]);
  });

  it('protects existing public assets from the official overwrite merge strategy', async () => {
    const tree = await workspace();
    tree.create('/projects/maps/public/favicon.ico', Buffer.from([0, 1, 2]));
    const before = snapshot(tree);
    await expect(run({}, tree)).rejects.toThrow(/favicon.ico.*already exists.*overwritten/);
    expect(snapshot(tree)).toEqual(before);
    expect(runner.tasks).toEqual([]);
  });

  it('delegates duplicate-project validation without overwriting the original application', async () => {
    const once = await run({ skipInstall: true });
    const before = snapshot(once);
    await expect(run({}, once)).rejects.toThrow(/already exists/);
    expect(snapshot(once)).toEqual(before);
    expect(runner.tasks).toEqual([]);
  });

  it.each(['bad/name', '', '../unsafe'])(
    'delegates invalid application name %s to the official schema',
    async (name) => {
      const tree = await workspace();
      const before = snapshot(tree);
      await expect(run({ name }, tree)).rejects.toThrow();
      expect(snapshot(tree)).toEqual(before);
    },
  );

  it('requires an application name and refuses unsupported configuration variants', async () => {
    runner = new SchematicTestRunner('ngx-openlayers', fixture.collectionPath);
    await expect(runner.runSchematic('application', {}, await workspace())).rejects.toThrow(/name/);
    await expect(run({ ssr: true })).rejects.toThrow(/Unknown option "ssr"/);
  });

  it('requires an existing Angular workspace', async () => {
    const tree = Tree.empty();
    await expect(run({}, tree)).rejects.toThrow();
    expect(snapshot(tree)).toEqual({});
  });
});
