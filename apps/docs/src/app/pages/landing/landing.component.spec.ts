import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';

import { LandingComponent } from './landing.component';

const mocks = vi.hoisted(() => ({
  NgDocButtonComponent: class {},
  NgDocIconComponent: class {},
  NgDocTextComponent: class {},
  NgDocTextRightDirective: class {},
  HeroBannerComponent: class {},
}));

vi.mock('@ng-doc/ui-kit', () => ({
  NgDocButtonComponent: mocks.NgDocButtonComponent,
  NgDocIconComponent: mocks.NgDocIconComponent,
  NgDocTextComponent: mocks.NgDocTextComponent,
  NgDocTextRightDirective: mocks.NgDocTextRightDirective,
}));

vi.mock('./components', () => ({
  HeroBannerComponent: mocks.HeroBannerComponent,
}));

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(LandingComponent, {
        set: {
          imports: [RouterLink],
          template: `
            <a class="cta" [routerLink]="['guide']">Get Started</a>
            @for (badge of badges; track badge.name) {
              <a class="badge" [href]="badge.link">
                <img [src]="badge.img" [alt]="badge.name" />
              </a>
            }
            @for (feature of features; track feature.title) {
              <section class="feature">
                <h2>{{ feature.title }}</h2>
                <p>{{ feature.description }}</p>
              </section>
            }
          `,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defines the npm, stars, and license badges', () => {
    expect(component.badges).toEqual([
      {
        name: 'version',
        img: 'https://img.shields.io/npm/v/@workletjs/ngx-openlayers.svg?style=for-the-badge',
        link: 'https://www.npmjs.com/package/@workletjs/ngx-openlayers',
      },
      {
        name: 'stars',
        img: 'https://img.shields.io/github/stars/workletjs/workletjs?style=for-the-badge',
        link: 'https://github.com/workletjs/workletjs/stargazers',
      },
      {
        name: 'license',
        img: 'https://img.shields.io/github/license/workletjs/workletjs.svg?style=for-the-badge',
        link: 'https://github.com/workletjs/workletjs/blob/main/LICENSE',
      },
    ]);
  });

  it('defines the three landing page feature summaries', () => {
    expect(component.features.map((feature) => feature.title)).toEqual([
      'Declarative Mapping',
      'High-Performance Layers',
      'Modular Map Controls',
    ]);
  });

  it('renders one badge image per badge definition', () => {
    const badges = Array.from(fixture.nativeElement.querySelectorAll('.badge img'));

    expect(badges).toHaveLength(component.badges.length);
    expect(badges.map((badge) => badge.getAttribute('alt'))).toEqual(
      component.badges.map((badge) => badge.name),
    );
  });

  it('renders each feature title and description', () => {
    const features = Array.from(fixture.nativeElement.querySelectorAll('.feature'));

    expect(features).toHaveLength(component.features.length);
    expect(features.map((feature) => feature.querySelector('h2')?.textContent?.trim())).toEqual(
      component.features.map((feature) => feature.title),
    );
  });

  it('renders the get started call to action', () => {
    expect(fixture.nativeElement.querySelector('.cta')?.textContent?.trim()).toBe('Get Started');
  });
});
