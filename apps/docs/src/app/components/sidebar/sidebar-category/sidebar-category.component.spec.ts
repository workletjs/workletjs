import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { SidebarCategoryComponent } from './sidebar-category.component';

type NgDocNavigation = {
  title?: string;
  route: string;
  expandable?: boolean;
  children?: NgDocNavigation[];
};

const mocks = vi.hoisted(() => {
  class NgDocRouteActiveDirective {
    static ɵdir = { standalone: true };
  }

  class NgDocDotComponent {
    static ɵcmp = { standalone: true };
  }

  class NgDocExpanderComponent {
    static ɵcmp = { standalone: true };
  }

  class NgDocIconComponent {
    static ɵcmp = { standalone: true };
  }

  class NgDocRotatorDirective {
    static ɵdir = { standalone: true };
  }

  class NgDocTextComponent {
    static ɵcmp = { standalone: true };
  }

  class NgDocTextLeftDirective {
    static ɵdir = { standalone: true };
  }

  class PolymorpheusOutlet {
    static ɵdir = { standalone: true };
  }

  return {
    NgDocRouteActiveDirective,
    NgDocDotComponent,
    NgDocExpanderComponent,
    NgDocIconComponent,
    NgDocRotatorDirective,
    NgDocTextComponent,
    NgDocTextLeftDirective,
    PolymorpheusOutlet,
  };
});

vi.mock('@ng-doc/app', () => ({
  NgDocRouteActiveDirective: mocks.NgDocRouteActiveDirective,
}));

vi.mock('@ng-doc/ui-kit', () => ({
  NgDocDotComponent: mocks.NgDocDotComponent,
  NgDocExpanderComponent: mocks.NgDocExpanderComponent,
  NgDocIconComponent: mocks.NgDocIconComponent,
  NgDocRotatorDirective: mocks.NgDocRotatorDirective,
  NgDocTextComponent: mocks.NgDocTextComponent,
  NgDocTextLeftDirective: mocks.NgDocTextLeftDirective,
}));

vi.mock('@taiga-ui/polymorpheus', () => ({
  PolymorpheusOutlet: mocks.PolymorpheusOutlet,
}));

describe('SidebarCategoryComponent', () => {
  let component: SidebarCategoryComponent;
  let fixture: ComponentFixture<SidebarCategoryComponent>;
  let routerEvents: Subject<unknown>;

  const category = {
    title: 'Guide',
    route: '/guide',
    expandable: true,
  } satisfies NgDocNavigation;

  beforeEach(async () => {
    routerEvents = new Subject();

    await TestBed.configureTestingModule({
      imports: [SidebarCategoryComponent],
      providers: [{ provide: Router, useValue: { events: routerEvents } }],
    })
      .overrideComponent(SidebarCategoryComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarCategoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('category', category);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reflects root and expandable state on host attributes', async () => {
    fixture.componentRef.setInput('isRoot', true);
    fixture.componentRef.setInput('expandable', false);

    await fixture.whenStable();

    expect(fixture.nativeElement.getAttribute('data-ng-doc-is-root')).toBe('true');
    expect(fixture.nativeElement.getAttribute('data-ng-doc-expandable')).toBe('false');
  });

  it('toggles the expanded state', () => {
    expect(component.expanded()).toBe(true);

    component.toggle();

    expect(component.expanded()).toBe(false);
  });

  it('collapses expandable categories', () => {
    component.collapse();

    expect(component.expanded()).toBe(false);
  });

  it('does not collapse non-expandable categories', async () => {
    fixture.componentRef.setInput('category', {
      title: 'Overview',
      route: '/overview',
      expandable: false,
    } satisfies NgDocNavigation);

    await fixture.whenStable();

    component.collapse();

    expect(component.expanded()).toBe(true);
  });

  it('expands when navigation ends inside the category route', () => {
    component.expanded.set(false);

    routerEvents.next(new NavigationEnd(1, '/guide/intro', '/guide/intro'));

    expect(component.expanded()).toBe(true);
  });
});
