import { Component, ProviderToken, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { APP_ROUTES } from './app.routes';

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
      {
        path: 'guides',
        title: 'Guides',
        children: [
          category('get-started', 'Get Started', ['first-map', 'installation', 'overview']),
          category('development', 'Development', ['component-usage']),
          category('reference', 'Reference', ['upgrading', 'compatibility', 'angular-cli']),
        ],
      },
      {
        path: 'components',
        title: 'Components',
        children: [category('general', 'General', ['map', 'view'])],
      },
    ],
  };
});

describe('documentation routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(APP_ROUTES)] });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it.each([
    ['/guides', '/guides/get-started/overview', 'Get Started'],
    ['/components', '/components/general/map', 'General'],
  ])(
    'opens the explicit default for %s regardless of discovery order',
    async (url, target, title) => {
      await harness.navigateByUrl(url);
      expect(router.url).toBe(target);
      expect(harness.routeNativeElement?.textContent).toContain(title);
    },
  );

  it.each([
    ['/guides/get-started/overview', 'Get Started'],
    ['/guides/get-started/installation', 'Get Started'],
    ['/guides/get-started/first-map', 'Get Started'],
    ['/guides/development/component-usage', 'Development'],
    ['/guides/reference/angular-cli', 'Reference'],
    ['/guides/reference/compatibility', 'Reference'],
    ['/guides/reference/upgrading', 'Reference'],
    ['/components/general/map', 'General'],
    ['/components/general/view', 'General'],
  ])('opens %s with generated page loaders and category providers', async (url, title) => {
    await harness.navigateByUrl(url);
    expect(router.url).toBe(url);
    expect(harness.routeNativeElement?.textContent).toContain(title);
  });

  it.each([
    ['/guides/get-started/overview', '/components/general/map', 'General'],
    ['/components/general/map', '/guides/reference/angular-cli', 'Reference'],
  ])('navigates from %s to %s across documentation sections', async (start, target, title) => {
    await harness.navigateByUrl(start);
    await harness.navigateByUrl(target);
    expect(router.url).toBe(target);
    expect(harness.routeNativeElement?.textContent).toContain(title);
  });
});
