import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarItemComponent } from './sidebar-item.component';

type SidebarItem = {
  title: string;
  route: string;
  metadata?: {
    tags: Record<string, string[]>;
  };
};

const mocks = vi.hoisted(() => {
  class NgDocDotComponent {
    static ɵcmp = { standalone: true };
  }

  class NgDocTagComponent {
    static ɵcmp = { standalone: true };
  }

  class NgDocTextComponent {
    static ɵcmp = { standalone: true };
  }

  return {
    NgDocDotComponent,
    NgDocTagComponent,
    NgDocTextComponent,
  };
});

vi.mock('@ng-doc/ui-kit', () => ({
  NgDocDotComponent: mocks.NgDocDotComponent,
  NgDocTagComponent: mocks.NgDocTagComponent,
  NgDocTextComponent: mocks.NgDocTextComponent,
}));

describe('SidebarItemComponent', () => {
  let component: SidebarItemComponent;
  let fixture: ComponentFixture<SidebarItemComponent>;

  const item = {
    title: 'API',
    route: '/api',
  } satisfies SidebarItem;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarItemComponent],
    })
      .overrideComponent(SidebarItemComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', item);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns an empty status list when no status tags exist', () => {
    expect(component.statuses()).toEqual([]);
  });

  it('maps status tags into color and text pairs', async () => {
    fixture.componentRef.setInput('item', {
      title: 'Guide',
      route: '/guide',
      metadata: {
        tags: {
          status: [':warning Beta', 'success Stable'],
        },
      },
    } satisfies SidebarItem);

    await fixture.whenStable();

    expect(component.statuses()).toEqual([
      { type: 'warning', text: 'Beta' },
      { type: 'success', text: 'Stable' },
    ]);
  });
});
