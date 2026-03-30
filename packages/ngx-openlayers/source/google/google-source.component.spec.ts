import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import Google from 'ol/source/Google';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolGoogleSourceComponent } from './google-source.component';

async function createGoogleInstance(
  setup?: (c: TestGoogleSourceComponent) => void,
): Promise<Google> {
  const f = TestBed.createComponent(TestGoogleSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolGoogleSourceComponent))
    .componentInstance.getInstance() as Google;
}

@Component({
  selector: 'wol-test-google-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolGoogleSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-google-source
            [wolKey]="wolKey()"
            [wolAttributions]="attributions()"
            [wolAttributionsCollapsible]="attributionsCollapsible()"
            [wolMapType]="mapType()"
            [wolLanguage]="language()"
            [wolRegion]="region()"
            [wolImageFormat]="imageFormat()"
            [wolScale]="scale()"
            [wolHighDpi]="highDpi()"
            [wolLayerTypes]="layerTypes()"
            [wolOverlay]="overlay()"
            [wolStyles]="styles()"
            [wolInterpolate]="interpolate()"
            [wolCacheSize]="cacheSize()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolApiOptions]="apiOptions()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolZDirection]="zDirection()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestGoogleSourceComponent {
  wolKey = signal('test-api-key');
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  mapType = signal<string | undefined>(undefined);
  language = signal<string | undefined>(undefined);
  region = signal<string | undefined>(undefined);
  imageFormat = signal<string | undefined>(undefined);
  scale = signal<string | undefined>(undefined);
  highDpi = signal<boolean | undefined>(undefined);
  layerTypes = signal<string[] | undefined>(undefined);
  overlay = signal<boolean | undefined>(undefined);
  styles = signal<Record<string, WolSafeAny>[] | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  apiOptions = signal<string[] | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolGoogleSourceComponent', () => {
  let fixture: ComponentFixture<TestGoogleSourceComponent>;
  let testComponent: TestGoogleSourceComponent;
  let component: WolGoogleSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let google: Google;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestGoogleSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestGoogleSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolGoogleSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    google = component.getInstance() as Google;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the Google source', () => {
    expect(component).toBeTruthy();
    expect(google).toBeInstanceOf(Google);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(google);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolKey', async () => {
    const inst = await createGoogleInstance((c) => c.wolKey.set('my-key'));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createGoogleInstance((c) => c.attributions.set('© Test'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolAttributionsCollapsible = false', async () => {
    const inst = await createGoogleInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolMapType', async () => {
    const inst = await createGoogleInstance((c) => c.mapType.set('satellite'));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolLanguage', async () => {
    const inst = await createGoogleInstance((c) => c.language.set('de'));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolRegion', async () => {
    const inst = await createGoogleInstance((c) => c.region.set('DE'));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolImageFormat', async () => {
    const inst = await createGoogleInstance((c) => c.imageFormat.set('png'));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolScale', async () => {
    const inst = await createGoogleInstance((c) => c.scale.set('scaleFactor2x'));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolHighDpi = true', async () => {
    const inst = await createGoogleInstance((c) => c.highDpi.set(true));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolHighDpi = false', async () => {
    const inst = await createGoogleInstance((c) => c.highDpi.set(false));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolLayerTypes', async () => {
    const inst = await createGoogleInstance((c) => c.layerTypes.set(['layerRoadmap']));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolOverlay = true', async () => {
    const inst = await createGoogleInstance((c) => c.overlay.set(true));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolStyles', async () => {
    const inst = await createGoogleInstance((c) =>
      c.styles.set([{ featureType: 'all', elementType: 'geometry' }]),
    );
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createGoogleInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createGoogleInstance((c) => c.cacheSize.set(256));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createGoogleInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolTileLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createGoogleInstance((c) => c.tileLoadFunction.set(fn));
    expect(inst.getTileLoadFunction()).toBe(fn);
  });

  it('should initialize with wolApiOptions', async () => {
    const inst = await createGoogleInstance((c) => c.apiOptions.set(['libraries=places']));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createGoogleInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createGoogleInstance((c) => c.transition.set(500));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolZDirection', async () => {
    const inst = await createGoogleInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(Google);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createGoogleInstance((c) => c.properties.set({ foo: 'bar' }));
    expect(inst.getProperties()).toMatchObject({ foo: 'bar' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(google, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(google, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  it('should update tileLoadFunction when wolTileLoadFunction changes', () => {
    const newFn: LoadFunction = vi.fn();
    const spy = vi.spyOn(google, 'setTileLoadFunction');
    testComponent.tileLoadFunction.set(newFn);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newFn);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    google.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    google.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    google.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    google.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    google.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    google.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(google);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
