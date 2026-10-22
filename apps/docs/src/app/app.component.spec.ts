import { NG_DOC_CONTEXT, NgDocNavigation } from '@ng-doc/app';

import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';

import { Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEvents: Subject<unknown>;
  let locationPath: string;

  const navigation: NgDocNavigation[] = [
    {
      title: 'Guides',
      route: '/guides',
      children: [{ title: 'Overview', route: '/guides/get-started/overview' }],
    },
    {
      title: 'Components',
      route: '/components',
      children: [{ title: 'Map', route: '/components/general/map' }],
    },
  ];

  const createComponent = () => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const navigate = (path: string, requestedPath = path) => {
    locationPath = path;
    routerEvents.next(new NavigationEnd(1, requestedPath, path));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    routerEvents = new Subject();
    locationPath = '';

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: NG_DOC_CONTEXT, useValue: { navigation } },
        { provide: Router, useValue: { events: routerEvents } },
        { provide: Location, useValue: { path: () => locationPath } },
      ],
    })
      // Test route state independently of NgDoc's layout and search services.
      .overrideComponent(AppComponent, { set: { template: '' } })
      .compileComponents();
  });

  it('defaults to the landing page without an active documentation section', () => {
    createComponent();

    expect(component['isLandingPage']()).toBe(true);
    expect(component['section']()).toBeNull();
    expect(component['navigation']()).toBe(navigation);
    expect(fixture.nativeElement.getAttribute('data-ng-doc-is-landing')).toBe('true');
  });

  it.each([
    ['/guides', 'guides'],
    ['/guides/get-started/overview', 'guides'],
    ['/components', 'components'],
    ['/components/general/map/api', 'components'],
  ])('recognizes the section on an initial visit to %s', (path, section) => {
    locationPath = path;
    createComponent();

    expect(component['section']()).toBe(section);
    expect(component['isLandingPage']()).toBe(false);
    expect(fixture.nativeElement.getAttribute('data-ng-doc-is-landing')).toBe('false');
  });

  it('switches sections as the reader navigates between Guides and Components', () => {
    createComponent();
    navigate('/guides/get-started/overview');
    expect(component['section']()).toBe('guides');
    expect(component['navigation']()).toBe(navigation[0].children);

    navigate('/components/general/map');
    expect(component['section']()).toBe('components');
    expect(component['navigation']()).toBe(navigation[1].children);

    navigate('/guides/development/component-usage');
    expect(component['section']()).toBe('guides');
  });

  it('uses the final location after a redirect', () => {
    createComponent();
    navigate('/guides/get-started/overview', '/guides');

    expect(component['section']()).toBe('guides');
  });

  it('clears the documentation section when returning to the landing page', () => {
    createComponent();
    navigate('/components/general/map');
    navigate('/');

    expect(component['section']()).toBeNull();
    expect(component['isLandingPage']()).toBe(true);
    expect(fixture.nativeElement.getAttribute('data-ng-doc-is-landing')).toBe('true');
  });

  it.each(['/guides-extra', '/components-extra', '/other/guides'])(
    'requires a complete section segment in %s',
    (path) => {
      createComponent();
      navigate(path);

      expect(component['section']()).toBeNull();
    },
  );

  it.each([
    ['/?search=map#top', null, true],
    ['/guides?search=map#top', 'guides', false],
    ['/components/general/map?search=map#api', 'components', false],
  ])('ignores query parameters and fragments in %s', (path, section, isLandingPage) => {
    locationPath = path;
    createComponent();

    expect(component['section']()).toBe(section);
    expect(component['isLandingPage']()).toBe(isLandingPage);
  });

  it('waits for NavigationEnd before updating the current section', () => {
    createComponent();
    locationPath = '/components/general/map';
    routerEvents.next({ url: locationPath });

    expect(component['section']()).toBeNull();
    expect(component['isLandingPage']()).toBe(true);
  });

  it('stops observing navigation when destroyed', () => {
    createComponent();
    navigate('/guides/get-started/overview');
    fixture.destroy();
    locationPath = '/components/general/map';
    routerEvents.next(new NavigationEnd(2, locationPath, locationPath));

    expect(component['section']()).toBe('guides');
  });
});
