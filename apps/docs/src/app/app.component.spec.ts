import { BreakpointObserver } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

vi.mock('@ng-doc/app', () => {
  class NgDocCustomSidebarDirective {}
  class NgDocNavbarComponent {}
  class NgDocRootComponent {}
  class NgDocThemeToggleComponent {}

  Object.defineProperty(NgDocCustomSidebarDirective, 'ɵdir', { value: { standalone: true } });
  Object.defineProperty(NgDocNavbarComponent, 'ɵcmp', { value: { standalone: true } });
  Object.defineProperty(NgDocRootComponent, 'ɵcmp', { value: { standalone: true } });
  Object.defineProperty(NgDocThemeToggleComponent, 'ɵcmp', { value: { standalone: true } });

  return {
    NgDocCustomSidebarDirective,
    NgDocNavbarComponent,
    NgDocRootComponent,
    NgDocThemeToggleComponent,
  };
});

vi.mock('@ng-doc/ui-kit', () => {
  class NgDocButtonIconComponent {}
  class NgDocIconComponent {}
  class NgDocTooltipDirective {}

  Object.defineProperty(NgDocButtonIconComponent, 'ɵcmp', { value: { standalone: true } });
  Object.defineProperty(NgDocIconComponent, 'ɵcmp', { value: { standalone: true } });
  Object.defineProperty(NgDocTooltipDirective, 'ɵdir', { value: { standalone: true } });

  return {
    NgDocButtonIconComponent,
    NgDocIconComponent,
    NgDocTooltipDirective,
  };
});

vi.mock('./components', () => {
  class SidebarComponent {}

  Object.defineProperty(SidebarComponent, 'ɵcmp', { value: { standalone: true } });

  return {
    SidebarComponent,
  };
});

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEvents: Subject<unknown>;
  let breakpointMatches: Subject<{ matches: boolean }>;

  beforeEach(async () => {
    routerEvents = new Subject();
    breakpointMatches = new Subject();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: { events: routerEvents } },
        { provide: BreakpointObserver, useValue: { observe: () => breakpointMatches } },
      ],
    })
      // Strip the NgDoc-heavy template so this stays a unit test of AppComponent's own logic.
      .overrideComponent(AppComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to the landing page and small-screen state', () => {
    expect(component['isLandingPage']()).toBe(true);
    expect(component['isSmallScreen']()).toBe(true);
  });

  it('marks the landing page inactive once navigation leaves "/"', () => {
    routerEvents.next(new NavigationEnd(1, '/guide', '/guide'));

    expect(component['isLandingPage']()).toBe(false);
  });

  it('marks the landing page active again when navigating back to "/"', () => {
    routerEvents.next(new NavigationEnd(1, '/guide', '/guide'));
    routerEvents.next(new NavigationEnd(2, '/', '/'));

    expect(component['isLandingPage']()).toBe(true);
  });

  it('ignores non-NavigationEnd router events', () => {
    routerEvents.next({ url: '/guide' });

    expect(component['isLandingPage']()).toBe(true);
  });

  it('tracks the small-screen breakpoint state', () => {
    breakpointMatches.next({ matches: false });

    expect(component['isSmallScreen']()).toBe(false);
  });

  it('hides the sidebar only on the landing page for large screens', () => {
    breakpointMatches.next({ matches: false });

    expect(component['showSidebar']()).toBe(false);
  });

  it('shows the sidebar on large screens once navigated away from the landing page', () => {
    breakpointMatches.next({ matches: false });
    routerEvents.next(new NavigationEnd(1, '/guide', '/guide'));

    expect(component['showSidebar']()).toBe(true);
  });

  it('shows the sidebar on the landing page for small screens', () => {
    expect(component['showSidebar']()).toBe(true);
  });

  it('applies the landing-page host class by default', () => {
    expect(fixture.nativeElement.classList.contains('workletjs-landing-page')).toBe(true);
  });

  it('removes the landing-page host class after navigating away from "/"', () => {
    routerEvents.next(new NavigationEnd(1, '/guide', '/guide'));
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('workletjs-landing-page')).toBe(false);
  });
});
