import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolOSMSourceComponent } from './osm-source.component';

async function createOSMInstance(setup?: (c: TestOSMSourceComponent) => void): Promise<OSM> {
  const f = TestBed.createComponent(TestOSMSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolOSMSourceComponent))
    .componentInstance.getInstance() as OSM;
}

@Component({
  selector: 'wol-test-osm-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolOSMSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-osm-source
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolMaxZoom]="maxZoom()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolTransition]="transition()"
            [wolUrl]="url()"
            [wolWrapX]="wrapX()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestOSMSourceComponent {
  attributions = signal<string | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolOSMSourceComponent', () => {
  let fixture: ComponentFixture<TestOSMSourceComponent>;
  let testComponent: TestOSMSourceComponent;
  let component: WolOSMSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let osm: OSM;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestOSMSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOSMSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(WolOSMSourceComponent)).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    osm = component.getInstance() as OSM;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the OSM source', () => {
    expect(component).toBeTruthy();
    expect(osm).toBeInstanceOf(OSM);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(osm);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createOSMInstance((c) => c.attributions.set('© OSM contributors'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createOSMInstance((c) => c.cacheSize.set(256));
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createOSMInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createOSMInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createOSMInstance((c) => c.maxZoom.set(16));
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createOSMInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolTileLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createOSMInstance((c) => c.tileLoadFunction.set(fn));
    expect(inst.getTileLoadFunction()).toBe(fn);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createOSMInstance((c) => c.transition.set(300));
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createOSMInstance((c) =>
      c.url.set('https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    );
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createOSMInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(OSM);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createOSMInstance((c) => c.properties.set({ label: 'test-osm' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-osm' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(osm, 'setAttributions');
    testComponent.attributions.set('© New');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© New');
  });

  it('should update tileLoadFunction when wolTileLoadFunction changes', () => {
    const spy = vi.spyOn(osm, 'setTileLoadFunction');
    const fn: LoadFunction = vi.fn();
    testComponent.tileLoadFunction.set(fn);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(osm, 'setUrl');
    const newUrl = 'https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png';
    testComponent.url.set(newUrl);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrl);
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(osm, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps, false);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    osm.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    osm.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    osm.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    osm.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    osm.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    osm.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(osm);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
