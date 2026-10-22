import { NgDocNavigation } from '@ng-doc/app';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { LayoutSidebarCategoryComponent } from './layout-sidebar-category.component';

describe('LayoutSidebarCategoryComponent', () => {
  let component: LayoutSidebarCategoryComponent;
  let fixture: ComponentFixture<LayoutSidebarCategoryComponent>;
  let routerEvents: Subject<unknown>;
  let router: { events: Subject<unknown>; url: string };

  const category: NgDocNavigation = { title: 'Get started', route: '/guides/get-started' };

  const navigate = (path: string) => {
    router.url = path;
    routerEvents.next(new NavigationEnd(1, path, path));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    routerEvents = new Subject();
    router = { events: routerEvents, url: '/' };

    await TestBed.configureTestingModule({
      imports: [LayoutSidebarCategoryComponent],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutSidebarCategoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('category', category);
    fixture.componentRef.setInput('content', 'Category pages');
    await fixture.whenStable();
  });

  it('connects the category toggle to its content with accessible expanded state', () => {
    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector('button');
    const children = element.querySelector('.wol-docs-layout-sidebar-category-children');

    expect(button?.textContent).toContain('Get started');
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    expect(button?.getAttribute('aria-controls')).toBe(children?.id);
    expect(children?.textContent).toContain('Category pages');
  });

  it('toggles the category and retains its content when collapsed', () => {
    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector('button');
    const children = element.querySelector('.wol-docs-layout-sidebar-category-children');

    button?.click();
    fixture.detectChanges();

    expect(component.isExpanded()).toBe(false);
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(element.getAttribute('data-ng-doc-expanded')).toBe('false');
    expect(element.querySelector('.wol-docs-layout-sidebar-category-children')).toBe(children);
    expect(element.querySelector('[inert]')).not.toBeNull();

    button?.click();
    fixture.detectChanges();

    expect(component.isExpanded()).toBe(true);
    expect(button?.getAttribute('aria-expanded')).toBe('true');
  });

  it('follows changes to the expanded input', async () => {
    fixture.componentRef.setInput('expanded', false);
    await fixture.whenStable();
    expect(component.isExpanded()).toBe(false);

    fixture.componentRef.setInput('expanded', true);
    await fixture.whenStable();
    expect(component.isExpanded()).toBe(true);
  });

  it('keeps non-expandable categories open without rendering a toggle', async () => {
    fixture.componentRef.setInput('expandable', false);
    fixture.componentRef.setInput('expanded', false);
    fixture.componentRef.setInput('isRoot', true);
    await fixture.whenStable();

    component.collapse();
    component.toggle();
    fixture.detectChanges();

    expect(component.isExpanded()).toBe(true);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    expect(fixture.nativeElement.getAttribute('data-ng-doc-is-root')).toBe('true');
    expect(fixture.nativeElement.getAttribute('data-ng-doc-expandable')).toBe('false');
  });

  it('opens a collapsed category after navigation into one of its pages', () => {
    component.collapse();
    navigate('/guides/get-started/overview');

    expect(component.isExpanded()).toBe(true);
  });

  it('keeps unrelated navigation and intermediate router events from opening a category', () => {
    component.collapse();
    navigate('/components');
    expect(component.isExpanded()).toBe(false);

    router.url = '/guides/get-started/overview';
    routerEvents.next({ url: router.url });
    expect(component.isExpanded()).toBe(false);
  });

  it('stops reacting to router events when destroyed', () => {
    component.collapse();
    fixture.destroy();
    router.url = '/guides/get-started/overview';
    routerEvents.next(new NavigationEnd(1, router.url, router.url));

    expect(component.isExpanded()).toBe(false);
  });
});
