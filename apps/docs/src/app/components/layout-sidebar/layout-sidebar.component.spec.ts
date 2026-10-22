import { NgDocNavigation } from '@ng-doc/app';

import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LayoutSidebarComponent } from './layout-sidebar.component';

describe('LayoutSidebarComponent', () => {
  let component: LayoutSidebarComponent;
  let fixture: ComponentFixture<LayoutSidebarComponent>;

  const navigation: NgDocNavigation[] = [
    {
      title: 'Get started',
      route: '/guides/get-started',
      children: [
        { title: 'Overview', route: '/guides/get-started/overview' },
        {
          title: 'Advanced',
          route: '/guides/get-started/advanced',
          children: [{ title: 'Setup', route: '/guides/get-started/advanced/setup' }],
        },
        { title: 'Hidden page', route: '/guides/hidden-page', hidden: true },
      ],
    },
    { title: 'Reference', route: '/guides/reference' },
    {
      title: 'Hidden category',
      route: '/guides/hidden',
      hidden: true,
      children: [{ title: 'Hidden child', route: '/guides/hidden/child' }],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    vi.spyOn(TestBed.inject(Location), 'path').mockReturnValue('/guides/get-started/overview');
    fixture = TestBed.createComponent(LayoutSidebarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('wolNavigation', navigation);
    await fixture.whenStable();
  });

  it('uses the supplied root navigation and replaces it when the input changes', async () => {
    expect(component.getNavigation()).toEqual(navigation);

    const replacement = [{ title: 'Components', route: '/components' }];
    fixture.componentRef.setInput('wolNavigation', replacement);
    await fixture.whenStable();

    expect(component.getNavigation()).toEqual(replacement);
    expect(fixture.nativeElement.textContent).toContain('Components');
    expect(fixture.nativeElement.textContent).not.toContain('Get started');
  });

  it('returns a category children and an empty array for a page', () => {
    expect(component.getNavigation(navigation[0])).toEqual(navigation[0].children);
    expect(component.getNavigation(navigation[1])).toEqual([]);
  });

  it('matches the category of the current location', () => {
    expect(component.matchRoute('/guides/get-started')).toBe(true);
    expect(component.matchRoute('/components')).toBe(false);
  });

  it('renders nested navigation while excluding hidden pages and categories', () => {
    const element: HTMLElement = fixture.nativeElement;
    const titles = Array.from(element.querySelectorAll('a')).map((link) =>
      link.textContent?.trim(),
    );

    expect(titles).toEqual(['Overview', 'Setup', 'Reference']);
    expect(element.textContent).not.toContain('Hidden');
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Documentation');
  });

  it('marks root categories and pages separately from nested entries', () => {
    const element: HTMLElement = fixture.nativeElement;
    const categories = element.querySelectorAll('wol-docs-layout-sidebar-category');
    const pages = element.querySelectorAll('wol-docs-layout-sidebar-item');

    expect(
      Array.from(categories).map((category) => category.getAttribute('data-ng-doc-is-root')),
    ).toEqual(['true', 'false']);
    expect(Array.from(pages).map((page) => page.getAttribute('data-ng-doc-is-root'))).toEqual([
      'false',
      'false',
      'true',
    ]);
  });
});
