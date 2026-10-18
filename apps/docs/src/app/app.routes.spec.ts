import { Component, ProviderToken, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { appRoutes } from './app.routes';

@Component({ template: '{{ category }}' })
class DocumentationPage {
  readonly category =
    inject('category name' as unknown as ProviderToken<string>, { optional: true }) ?? 'Components';
}

vi.mock('@ng-doc/generated', () => {
  const category = (path: string, title: string, pages: string[]) => ({
    path,
    title,
    data: { ngDocTitle: 'category' },
    providers: [{ provide: 'category name', useValue: title }],
    children: [
      { path: '', redirectTo: pages[0], pathMatch: 'full' },
      ...pages.map((page) => ({
        path: page,
        title: page,
        data: { ngDocTitle: 'page' },
        loadChildren: async (): Promise<Routes> => [{ path: '', component: DocumentationPage }],
      })),
    ],
  });

  return {
    NG_DOC_ROUTING: [
      category('get-started', 'Get Started', ['first-map', 'installation', 'overview']),
      category('development', 'Development', ['component-usage']),
      category('reference', 'Reference', ['upgrading', 'compatibility', 'angular-cli']),
      category('components', 'Components', ['general/map']),
    ],
  };
});

describe('documentation routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(appRoutes)] });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it.each([
    ['/get-started', '/get-started/overview', 'Get Started'],
    ['/development', '/development/component-usage', 'Development'],
    ['/reference', '/reference/angular-cli', 'Reference'],
    ['/components', '/components/general/map', 'Components'],
  ])(
    'opens the explicit default for %s regardless of discovery order',
    async (url, target, title) => {
      await harness.navigateByUrl(url);
      expect(router.url).toBe(target);
      expect(harness.routeNativeElement?.textContent).toContain(title);
    },
  );

  it.each([
    ['/get-started/overview', 'Get Started'],
    ['/get-started/installation', 'Get Started'],
    ['/get-started/first-map', 'Get Started'],
    ['/development/component-usage', 'Development'],
    ['/reference/angular-cli', 'Reference'],
    ['/reference/compatibility', 'Reference'],
    ['/reference/upgrading', 'Reference'],
    ['/components/general/map', 'Components'],
  ])('opens %s with generated page loaders and category providers', async (url, title) => {
    await harness.navigateByUrl(url);
    expect(router.url).toBe(url);
    expect(harness.routeNativeElement?.textContent).toContain(title);
    if (!url.startsWith('/components')) {
      expect(router.routerState.snapshot.root.firstChild?.data['ngDocTitle']).toBe('category');
    }
  });

  it.each([
    ['/guide', '/get-started/overview'],
    ['/guide/introduction', '/get-started/overview'],
    ['/guide/getting-started', '/get-started/installation'],
  ])('preserves query parameters and fragments when redirecting %s', async (url, target) => {
    await harness.navigateByUrl(`${url}?search=map&tag=a&tag=b#old-heading`);
    expect(router.url).toBe(`${target}?search=map&tag=a&tag=b#old-heading`);
  });
});
