import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestCollection } from '../testing/collection';

const root = '/projects/app/src';
const files = ['ts', 'html', 'css', 'spec.ts'];

function host() {
  const tree = Tree.empty();
  tree.create(
    '/angular.json',
    JSON.stringify({
      version: 1,
      projects: {
        app: {
          projectType: 'application',
          root: 'projects/app',
          sourceRoot: 'projects/app/src',
          prefix: 'app',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: { browser: 'projects/app/src/start.ts', styles: ['src/styles.css'] },
            },
          },
        },
      },
    }),
  );
  tree.create('/package.json', JSON.stringify({ dependencies: { '@angular/core': '~22.2.0' } }));
  tree.create(
    `${root}/start.ts`,
    `import { bootstrapApplication } from '@angular/platform-browser';
import { Root } from './shell/root';
import { config } from './settings';
bootstrapApplication(Root, config);`,
  );
  tree.create(
    `${root}/settings.ts`,
    `import { provideRouter } from '@angular/router';
import { routes } from './pages';
export const config = { providers: [provideRouter(routes)] };`,
  );
  tree.create(
    `${root}/pages.ts`,
    `import { Routes } from '@angular/router';
export const routes: Routes = [{ path: ':id', component: Existing }, { path: '**', redirectTo: '' }];`,
  );
  tree.create(
    `${root}/shell/root.ts`,
    `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({ imports: [RouterOutlet], templateUrl: './root.html' })
export class Root {}`,
  );
  tree.create(`${root}/shell/root.html`, '<h1>Existing app</h1><main><router-outlet /></main>');
  return tree;
}

function snapshot(tree: Tree) {
  const result: Record<string, string> = {};
  tree.visit((path) => (result[path] = tree.readText(path)));
  return result;
}

function componentFile(name = 'map-example', extension = 'ts') {
  return `${root}/app/${name}/${name}.${extension}`;
}

describe('ng-add routed example through the published collection', () => {
  let fixture: ReturnType<typeof createTestCollection>;

  beforeAll(() => (fixture = createTestCollection()));
  afterAll(() => fixture?.cleanup());

  const run = (tree = host(), options: object = {}) =>
    new SchematicTestRunner('ngx-openlayers', fixture.collectionPath).runSchematic(
      'ng-add',
      { example: true, skipInstall: true, ...options },
      tree,
    );

  it('generates a minimal map and puts its lazy route first without changing existing UI', async () => {
    const tree = host();
    const originalRoot = tree.readText(`${root}/shell/root.ts`);
    const originalTemplate = tree.readText(`${root}/shell/root.html`);
    const result = await run(tree);
    const routes = result.readText(`${root}/pages.ts`);
    expect(routes).toContain("path: 'map'");
    expect(routes).toContain("import('./app/map-example/map-example')");
    expect(routes).toContain('m.MapExample');
    expect(routes.indexOf("path: 'map'")).toBeLessThan(routes.indexOf("path: ':id'"));
    expect(routes.indexOf("path: ':id'")).toBeLessThan(routes.indexOf("path: '**'"));
    expect(result.readText(`${root}/shell/root.ts`)).toBe(originalRoot);
    expect(result.readText(`${root}/shell/root.html`)).toBe(originalTemplate);
    for (const extension of files)
      expect(result.exists(componentFile(undefined, extension))).toBe(true);
    const source = result.readText(componentFile());
    for (const entry of ['/map', '/view', '/layer/tile', '/source/osm']) {
      expect(source).toContain(`@workletjs/ngx-openlayers${entry}`);
    }
    expect(source).not.toContain('standalone: true');
    expect(result.readText(componentFile(undefined, 'html'))).toContain('[wolCenter]="[0, 0]"');
    expect(result.readText(componentFile(undefined, 'html'))).toContain('[wolZoom]="2"');
    expect(result.readText(componentFile(undefined, 'html'))).toContain('tabindex="0"');
    expect(result.readText(componentFile(undefined, 'css'))).toContain('height: 400px');
    const spec = result.readText(componentFile(undefined, 'spec.ts'));
    expect(spec).toContain('overrideComponent');
    expect(spec).toContain('querySelector');
    expect(spec).not.toContain('ResizeObserver');
  });

  it('supports independently chosen example names and routes', async () => {
    const result = await run(host(), { exampleName: 'world-view', route: 'globe' });
    expect(result.readText(`${root}/pages.ts`)).toContain("path: 'globe'");
    expect(result.readText(`${root}/pages.ts`)).toContain('m.WorldView');
    expect(result.readText(componentFile('world-view'))).toContain('export class WorldView');
  });

  it.each(['Map', '', 'nested/map', '../map', 'map--example', ':id', '*', 'map?x=1', 'map#x'])(
    'rejects invalid component or route segment %j without writes',
    async (value) => {
      for (const key of ['exampleName', 'route']) {
        const tree = host();
        const before = snapshot(tree);
        await expect(run(tree, { [key]: value })).rejects.toThrow(/kebab-case/);
        expect(snapshot(tree)).toEqual(before);
      }
    },
  );

  it('preserves an edited complete example on repeated execution', async () => {
    const once = await run();
    once.overwrite(componentFile(undefined, 'html'), '<h1>My modified map</h1>');
    const before = snapshot(once);
    const twice = await run(once);
    expect(snapshot(twice)).toEqual(before);
  });

  it('rejects incomplete repeated output instead of silently regenerating it', async () => {
    const once = await run();
    once.delete(componentFile(undefined, 'css'));
    const before = snapshot(once);
    await expect(run(once)).rejects.toThrow(/incomplete/i);
    expect(snapshot(once)).toEqual(before);
  });

  it('protects same-name files and route conflicts before setup writes', async () => {
    const tree = host();
    tree.create(componentFile(), '// Existing business component');
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(/conflict|already exists/i);
    expect(snapshot(tree)).toEqual(before);
  });

  it.each([
    `[{ path: 'map', redirectTo: 'home' }]`,
    `[{ path: '', children: [{ path: 'map', component: Business }] }]`,
  ])('rejects existing path collision in %s', async (routes) => {
    const tree = host();
    tree.overwrite(`${root}/pages.ts`, `export const routes = ${routes};`);
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(/route.*map.*conflict|route.*map.*already/i);
    expect(snapshot(tree)).toEqual(before);
  });

  it('does not alias an existing example at a different requested route', async () => {
    const once = await run();
    await expect(run(once, { route: 'another' })).rejects.toThrow(/conflict|already exists/i);
  });
});

describe('static routed-example host shapes', () => {
  let fixture: ReturnType<typeof createTestCollection>;
  beforeAll(() => (fixture = createTestCollection()));
  afterAll(() => fixture?.cleanup());

  const run = (tree: Tree, options: object = {}) =>
    new SchematicTestRunner('ngx-openlayers', fixture.collectionPath).runSchematic(
      'ng-add',
      { example: true, skipInstall: true, ...options },
      tree,
    );

  it.each([
    ['inline', `export const config = { providers: [provideRouter([])] };`],
    [
      'same-file variable',
      `const local = []; export const config = { providers: [provideRouter(local)] };`,
    ],
    [
      'aliased imported variable',
      `import { routes as pages } from './pages'; export const config = { providers: [provideRouter(pages)] };`,
    ],
  ])('supports %s routes', async (_name, config) => {
    const tree = host();
    tree.overwrite(
      `${root}/settings.ts`,
      `import { provideRouter } from '@angular/router';\n${config}`,
    );
    const result = await run(tree);
    const expected = config.includes("from './pages'") ? `${root}/pages.ts` : `${root}/settings.ts`;
    expect(result.readText(expected)).toContain("path: 'map'");
  });

  it('resolves bootstrap, config, Component and router import aliases with an inline root template', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/start.ts`,
      `
import { bootstrapApplication as boot } from '@angular/platform-browser';
import { Root as Shell } from './shell/root';
import { config as settings } from './settings';
boot(Shell, settings);`,
    );
    tree.overwrite(
      `${root}/settings.ts`,
      `
import { provideRouter as router } from '@angular/router';
import { routes as pages } from './pages';
export const config = { providers: [router(pages)] };`,
    );
    tree.overwrite(
      `${root}/shell/root.ts`,
      `
import { Component as C } from '@angular/core';
import { RouterOutlet as Outlet } from '@angular/router';
@C({ imports: [Outlet], template: '<router-outlet name="primary" />' })
export class Root {}`,
    );
    expect((await run(tree)).exists(componentFile())).toBe(true);
  });

  it('supports same-file bootstrap configuration and static type wrappers', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/start.ts`,
      `
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Root } from './shell/root';
const config = { providers: [provideRouter(([] as Routes) satisfies Routes)] };
bootstrapApplication(Root, config);`,
    );
    expect((await run(tree)).readText(`${root}/start.ts`)).toContain("path: 'map'");
  });

  it('supports a literal bootstrap config and a same-file root declaration', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/start.ts`,
      `
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
@Component({ imports: [RouterModule], template: '<router-outlet />' })
class Root {}
bootstrapApplication(Root, { providers: [provideRouter([])] });`,
    );
    expect((await run(tree)).readText(`${root}/start.ts`)).toContain("path: 'map'");
  });

  it.each([
    ['missing router', `export const config = { providers: [] };`, /provideRouter/],
    ['missing providers', `export const config = {};`, /Router provider/],
    ['factory config', `export const config = createConfig();`, /static object/],
    [
      'merged config',
      `export const config = mergeApplicationConfig(base, extra);`,
      /static object/,
    ],
    [
      'spread config',
      `export const config = { ...base, providers: [provideRouter([])] };`,
      /spread/,
    ],
    [
      'spread providers',
      `export const config = { providers: [...extra, provideRouter([])] };`,
      /spread/,
    ],
    [
      'router lookalike',
      `function provideRouter() {} export const config = { providers: [provideRouter([])] };`,
      /provideRouter/,
    ],
    [
      'multiple router providers',
      `import { provideRouter } from '@angular/router'; export const config = { providers: [provideRouter([]), provideRouter([])] };`,
      /exactly one/,
    ],
    [
      'router alias path',
      `import { routes } from '@app/routes'; import { provideRouter } from '@angular/router'; export const config = { providers: [provideRouter(routes)] };`,
      /relative import/,
    ],
  ])('rejects %s before any writes', async (_name, config, message) => {
    const tree = host();
    tree.overwrite(`${root}/settings.ts`, config);
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(message);
    expect(snapshot(tree)).toEqual(before);
    await expect(run(tree, { example: false })).resolves.toBeDefined();
  });

  it.each([
    [`createRoutes()`, /static array/],
    [`[...other]`, /spread/],
    [`[{ ...base, path: 'other' }]`, /spread/],
    [`[{ path: routeName }]`, /static strings/],
    [`[{ ['path']: 'other' }]`, /computed/],
    [`[{ path: '', children: loadRoutes() }]`, /static array/],
  ])('rejects unsupported route expression %s before writes', async (expression, message) => {
    const tree = host();
    tree.overwrite(`${root}/pages.ts`, `export const routes = ${expression};`);
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(message);
    expect(snapshot(tree)).toEqual(before);
  });

  it.each([
    ['no outlet', '<main>Business UI</main>'],
    ['commented outlet', '<!-- <router-outlet /> -->'],
    ['named outlet', '<router-outlet name="sidebar" />'],
    ['bound dynamic outlet', '<router-outlet [name]="name" />'],
    ['inert template outlet', '<ng-template><router-outlet /></ng-template>'],
    ['conditional outlet', '@if (visible) { <router-outlet /> }'],
  ])('rejects %s and preserves all host files', async (_name, html) => {
    const tree = host();
    tree.overwrite(`${root}/shell/root.html`, html);
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(/primary.*router-outlet/);
    expect(snapshot(tree)).toEqual(before);
  });

  it('accepts a statically bound primary outlet', async () => {
    const tree = host();
    tree.overwrite(`${root}/shell/root.html`, `<router-outlet [name]="'primary'" />`);
    expect((await run(tree)).exists(componentFile())).toBe(true);
  });

  it('rejects an outlet tag without its Angular router import', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/shell/root.ts`,
      `
import { Component } from '@angular/core';
@Component({ template: '<router-outlet />' }) export class Root {}`,
    );
    await expect(run(tree)).rejects.toThrow(/import RouterOutlet/);
  });

  it('rejects NgModule hosts while retaining normal installation support', async () => {
    const tree = host();
    tree.overwrite(`${root}/start.ts`, `platformBrowserDynamic().bootstrapModule(AppModule);`);
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(/standalone/);
    expect(snapshot(tree)).toEqual(before);
    await expect(run(tree, { example: false })).resolves.toBeDefined();
  });

  it('rejects malformed or missing root templates and dynamic root metadata', async () => {
    const cases = [
      `@Component({ imports: [RouterOutlet], template: html })`,
      `@Component({ imports: [RouterOutlet], templateUrl: './missing.html' })`,
      `@Component({ imports: [RouterOutlet], template: '<div>' })`,
      `@Component({ imports: [RouterOutlet], template: '<router-outlet />', standalone: false })`,
    ];
    for (const component of cases) {
      const tree = host();
      tree.overwrite(
        `${root}/shell/root.ts`,
        `
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
${component} export class Root {}`,
      );
      const before = snapshot(tree);
      await expect(run(tree)).rejects.toThrow(/map example/);
      expect(snapshot(tree)).toEqual(before);
    }
  });

  it.each([
    [`export let routes = []; routes = [{ path: 'map', component: Business }];`, /const|mutable/],
    [`export const routes = []; routes.push({ path: 'map', component: Business });`, /mutation/],
    [`export const routes = []; routes[0] = { path: 'map', component: Business };`, /mutation/],
  ])('rejects routes changed after their initializer', async (code, message) => {
    const tree = host();
    tree.overwrite(`${root}/pages.ts`, code);
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(message);
    expect(snapshot(tree)).toEqual(before);
  });

  it('rejects application configuration modified after initialization', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/settings.ts`,
      `
import { provideRouter } from '@angular/router';
export const config = { providers: [provideRouter([])] };
config.providers = [];`,
    );
    const before = snapshot(tree);
    await expect(run(tree)).rejects.toThrow(/mutation/);
    expect(snapshot(tree)).toEqual(before);
  });

  it('rejects mutation through an imported route variable before writes', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/settings.ts`,
      `
import { provideRouter } from '@angular/router';
import { routes } from './pages';
routes.push({ path: 'map', component: Business });
export const config = { providers: [provideRouter(routes)] };`,
    );
    await expect(run(tree).then(() => undefined)).rejects.toThrow(/mutation/);
  });

  it('rejects empty-path lazy children whose path collisions cannot be checked', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/pages.ts`,
      `export const routes = [{ path: '', loadChildren: () => import('./features') }];`,
    );
    await expect(run(tree).then(() => undefined)).rejects.toThrow(/empty-path.*lazy/);
  });

  it.each(['output directory', 'parent file'])(
    'rejects a %s that blocks generated files',
    async (kind) => {
      const tree = host();
      const path =
        kind === 'output directory' ? componentFile() + '/business.ts' : `${root}/app/map-example`;
      tree.create(path, '// Business file');
      const before = snapshot(tree);
      await expect(run(tree).then(() => undefined)).rejects.toThrow(/conflict/);
      expect(snapshot(tree)).toEqual(before);
    },
  );

  it.each(['', 'geo'])(
    'uses the application prefix %j for the generated selector',
    async (prefix) => {
      const tree = host();
      const workspace = JSON.parse(tree.readText('/angular.json'));
      workspace.projects.app.prefix = prefix;
      tree.overwrite('/angular.json', JSON.stringify(workspace));
      expect((await run(tree)).readText(componentFile())).toContain(
        `selector: '${prefix ? prefix + '-' : ''}map-example'`,
      );
    },
  );

  it('keeps existing comments and lazy route feature options', async () => {
    const tree = host();
    tree.overwrite(
      `${root}/settings.ts`,
      `
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './pages';
export const config = { providers: [provideRouter(routes, withHashLocation())] };`,
    );
    tree.overwrite(
      `${root}/pages.ts`,
      `export const routes = [\n  // Keep this existing route\n  { path: '**', redirectTo: '' },\n];`,
    );
    const result = await run(tree);
    expect(result.readText(`${root}/pages.ts`)).toContain('// Keep this existing route');
    expect(result.readText(`${root}/settings.ts`)).toBe(tree.readText(`${root}/settings.ts`));
  });
});
