import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { LayoutSidebarItemComponent } from './layout-sidebar-item.component';

describe('LayoutSidebarItemComponent', () => {
  let component: LayoutSidebarItemComponent;
  let fixture: ComponentFixture<LayoutSidebarItemComponent>;

  const item = { title: 'Overview', route: '/guides/overview' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSidebarItemComponent],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutSidebarItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', item);
    await fixture.whenStable();
  });

  it('renders the page title and route without status badges by default', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');

    expect(link.textContent?.trim()).toBe('Overview');
    expect(link.getAttribute('href')).toBe('/guides/overview');
    expect(component.statuses()).toEqual([]);
    expect(link.querySelectorAll('.wol-docs-layout-sidebar-status')).toHaveLength(0);
  });

  it('maps explicit colors and uncolored status text into sentence-case badges', async () => {
    fixture.componentRef.setInput('item', {
      ...item,
      metadata: {
        tags: {
          status: [':warning BETA RELEASE', '  NEW STYLES  ', ':danger', ''],
        },
      },
    });
    await fixture.whenStable();

    expect(component.statuses()).toEqual([
      { type: 'warning', text: 'Beta release' },
      { type: 'success', text: 'New styles' },
      { type: 'danger', text: '' },
      { type: 'success', text: '' },
    ]);

    const badges: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.wol-docs-layout-sidebar-status'),
    );
    expect(badges.map((badge) => badge.getAttribute('data-ng-doc-color'))).toEqual([
      'warning',
      'success',
      'danger',
      'success',
    ]);
    expect(badges.map((badge) => badge.textContent?.trim())).toEqual([
      'Beta release',
      'New styles',
      '',
      '',
    ]);
  });

  it('updates the badges when page metadata changes or omits status tags', async () => {
    fixture.componentRef.setInput('item', {
      ...item,
      metadata: { tags: { status: ['NEW'] } },
    });
    await fixture.whenStable();
    expect(component.statuses()).toEqual([{ type: 'success', text: 'New' }]);

    fixture.componentRef.setInput('item', { ...item, metadata: { tags: {} } });
    await fixture.whenStable();
    expect(component.statuses()).toEqual([]);
    expect(fixture.nativeElement.querySelector('.wol-docs-layout-sidebar-status')).toBeNull();
  });

  it('reflects whether the page is at the root of the navigation', async () => {
    expect(fixture.nativeElement.getAttribute('data-ng-doc-is-root')).toBe('false');

    fixture.componentRef.setInput('isRoot', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.getAttribute('data-ng-doc-is-root')).toBe('true');
  });

  it('marks the current page active and clears it when navigating elsewhere', async () => {
    const router = TestBed.inject(Router);
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');

    await router.navigateByUrl('/guides/overview');
    await fixture.whenStable();

    expect(link.classList.contains('active')).toBe(true);
    expect(link.getAttribute('aria-current')).toBe('page');

    await router.navigateByUrl('/guides/installation');
    await fixture.whenStable();

    expect(link.classList.contains('active')).toBe(false);
    expect(link.hasAttribute('aria-current')).toBe(false);
  });
});
