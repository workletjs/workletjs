import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FrameState } from 'ol/Map';
import { fromLonLat } from 'ol/proj';

import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceComponent } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { HeroBannerComponent } from './hero-banner.component';

describe('HeroBannerComponent', () => {
  let component: HeroBannerComponent;
  let fixture: ComponentFixture<HeroBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('starts with a real OpenLayers map centered on the Alps', () => {
    const map = fixture.debugElement.query(By.directive(WolMapComponent)).componentInstance;
    const view = fixture.debugElement.query(By.directive(WolViewComponent)).componentInstance;
    const source = fixture.debugElement.query(
      By.directive(WolOSMSourceComponent),
    ).componentInstance;

    expect(map.getInstance()).toBeDefined();
    expect(view.getInstance()?.getCenter()).toEqual(fromLonLat([7.6586, 45.9763]));
    expect(view.getInstance()?.getZoom()).toBe(9);
    expect(source.getInstance()?.getUrls()).toEqual([
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    ]);
    expect(source.getInstance()?.getAttributions()?.({} as FrameState)).toEqual([
      expect.stringContaining('https://www.openstreetmap.org/copyright'),
    ]);
  });

  it('offers keyboard focus and a name for the interactive map', () => {
    const map: HTMLElement = fixture.nativeElement.querySelector('wol-map');

    expect(map.getAttribute('tabindex')).toBe('0');
    expect(map.getAttribute('aria-label')).toBe('Interactive OpenStreetMap preview');
    expect(map.querySelector('.ol-zoom-in')).toBeTruthy();
    expect(map.querySelector('.ol-zoom-out')).toBeTruthy();
  });

  it('updates the selected button, OpenLayers view, and example when choosing a location', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.location-controls button'),
    );
    const view: WolViewComponent = fixture.debugElement.query(
      By.directive(WolViewComponent),
    ).componentInstance;

    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'Alps',
      'London',
      'Tokyo',
    ]);
    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual([
      'true',
      'false',
      'false',
    ]);

    buttons[1].click();
    fixture.detectChanges();

    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
    ]);
    expect(view.getInstance()?.getCenter()).toEqual(fromLonLat([-0.1276, 51.5072]));
    expect(view.getInstance()?.getZoom()).toBe(11);
    const example = fixture.nativeElement.querySelector('pre').textContent;
    expect(example).toContain(`[wolCenter]="[${component.centerCode()}]"`);
    expect(example).toContain('[wolZoom]="11"');
    expect(example).toContain('<wol-osm-source />');
  });

  it('keeps the code synchronized when the map view changes directly', () => {
    const view: WolViewComponent = fixture.debugElement.query(
      By.directive(WolViewComponent),
    ).componentInstance;

    view.getInstance()?.setZoom(12);
    view.getInstance()?.setCenter([150, 250]);
    fixture.detectChanges();

    const example = fixture.nativeElement.querySelector('pre').textContent;
    expect(example).toContain('[wolCenter]="[150, 250]"');
    expect(example).toContain('[wolZoom]="12"');
  });

  it('clears the selected preset after panning and restores it when selected again', () => {
    const view: WolViewComponent = fixture.debugElement.query(
      By.directive(WolViewComponent),
    ).componentInstance;
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.location-controls button'),
    );

    buttons[1].click();
    fixture.detectChanges();
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');

    view.getInstance()?.setCenter([150, 250]);
    fixture.detectChanges();
    expect(component.selectedLocation()).toBeUndefined();
    expect(buttons.every((button) => button.getAttribute('aria-pressed') === 'false')).toBe(true);

    buttons[1].click();
    fixture.detectChanges();
    expect(component.selectedLocation()?.name).toBe('London');
    expect(view.getInstance()?.getCenter()).toEqual(fromLonLat([-0.1276, 51.5072]));
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('clears the selected preset when zoom changes without moving the center', () => {
    const view: WolViewComponent = fixture.debugElement.query(
      By.directive(WolViewComponent),
    ).componentInstance;

    view.getInstance()?.setZoom(12);
    fixture.detectChanges();

    expect(component.selectedLocation()).toBeUndefined();
    expect(fixture.nativeElement.querySelector('[aria-pressed="true"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('pre').textContent).toContain('[wolZoom]="12"');
  });

  it('announces tile loading errors and lets the visitor choose a location to try again', () => {
    const source: WolOSMSourceComponent = fixture.debugElement.query(
      By.directive(WolOSMSourceComponent),
    ).componentInstance;
    const instance = source.getInstance();
    if (!instance) {
      throw new Error('Expected the OpenStreetMap source to be ready');
    }
    const refresh = vi.spyOn(instance, 'refresh');

    source.getInstance()?.dispatchEvent('tileloaderror');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Map tiles could not load.',
    );
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.location-controls button:last-child',
    );
    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    expect(refresh).toHaveBeenCalledOnce();
    expect(component.selectedLocation()?.name).toBe('Tokyo');
  });

  it('disposes the map and source when the preview is destroyed', () => {
    const map: WolMapComponent = fixture.debugElement.query(
      By.directive(WolMapComponent),
    ).componentInstance;
    const source: WolOSMSourceComponent = fixture.debugElement.query(
      By.directive(WolOSMSourceComponent),
    ).componentInstance;
    const instance = map.getInstance();

    fixture.destroy();

    expect(map.getInstance()).toBeUndefined();
    expect(source.getInstance()).toBeUndefined();
    expect(instance?.getTargetElement()).toBeNull();
  });
});
