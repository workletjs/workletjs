import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';

type NgDocNavigation = {
  title?: string;
  route: string;
  hidden?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  children?: NgDocNavigation[];
};

const mocks = vi.hoisted(() => {
  class NgDocBindPipe {
    static ɵpipe = { standalone: true };
  }

  class NgDocExecutePipe {
    static ɵpipe = { standalone: true };
  }

  class SidebarCategoryComponent {
    static ɵcmp = { standalone: true };
  }

  class SidebarItemComponent {
    static ɵcmp = { standalone: true };
  }

  return {
    NG_DOC_CONTEXT: Symbol('NG_DOC_CONTEXT'),
    NgDocBindPipe,
    NgDocExecutePipe,
    SidebarCategoryComponent,
    SidebarItemComponent,
  };
});

vi.mock('@ng-doc/app', () => ({
  NG_DOC_CONTEXT: mocks.NG_DOC_CONTEXT,
}));

vi.mock('@ng-doc/ui-kit', () => ({
  NgDocBindPipe: mocks.NgDocBindPipe,
  NgDocExecutePipe: mocks.NgDocExecutePipe,
}));

vi.mock('./sidebar-category', () => ({
  SidebarCategoryComponent: mocks.SidebarCategoryComponent,
}));

vi.mock('./sidebar-item', () => ({
  SidebarItemComponent: mocks.SidebarItemComponent,
}));

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let locationPath: string;

  const navigation: NgDocNavigation[] = [
    {
      title: 'Guide',
      route: '/guide',
      children: [{ title: 'Getting Started', route: '/guide/getting-started' }],
    },
    {
      title: 'API',
      route: '/api',
    },
  ];

  beforeEach(async () => {
    locationPath = '/guide/getting-started';

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: mocks.NG_DOC_CONTEXT, useValue: { navigation } },
        { provide: Location, useValue: { path: () => locationPath } },
      ],
    })
      .overrideComponent(SidebarComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns the root navigation when no node is provided', () => {
    expect(component.getNavigation()).toEqual(navigation);
  });

  it('returns a node children when one is provided', () => {
    const group = {
      title: 'Examples',
      route: '/examples',
      children: [{ title: 'Basic', route: '/examples/basic' }],
    } satisfies NgDocNavigation;

    expect(component.getNavigation(group)).toEqual(group.children);
  });

  it('returns an empty array when the provided node has no children', () => {
    expect(component.getNavigation({ title: 'Leaf', route: '/leaf' })).toEqual([]);
  });

  it('matches routes contained in the current location path', () => {
    expect(component.matchRoute('/guide')).toBe(true);
  });

  it('does not match routes absent from the current location path', () => {
    expect(component.matchRoute('/api')).toBe(false);
  });
});
