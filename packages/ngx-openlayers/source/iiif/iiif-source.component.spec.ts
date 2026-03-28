import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Versions } from 'ol/format/IIIFInfo';
import TileLayer from 'ol/layer/Tile';
import { Size } from 'ol/size';
import IIIF from 'ol/source/IIIF';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolIIIFSourceComponent } from './iiif-source.component';

const DEFAULT_SIZE: Size = [512, 512];

async function createIIIFInstance(setup?: (c: TestIIIFSourceComponent) => void): Promise<IIIF> {
  const f = TestBed.createComponent(TestIIIFSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolIIIFSourceComponent))
    .componentInstance.getInstance() as IIIF;
}

@Component({
  selector: 'wol-test-iiif-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolIIIFSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-iiif-source
            [wolSize]="size()"
            [wolAttributions]="attributions()"
            [wolAttributionCollapsible]="attributionCollapsible()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolFormat]="format()"
            [wolInterpolate]="interpolate()"
            [wolProjection]="projection()"
            [wolQuality]="quality()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolResolutions]="resolutions()"
            [wolSizes]="sizes()"
            [wolTilePixelRatio]="tilePixelRatio()"
            [wolTileSize]="tileSize()"
            [wolTransition]="transition()"
            [wolUrl]="url()"
            [wolVersion]="version()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestIIIFSourceComponent {
  size = signal<Size>(DEFAULT_SIZE);
  attributions = signal<string | undefined>(undefined);
  attributionCollapsible = signal<boolean | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  format = signal<string | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  quality = signal<string | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  resolutions = signal<number[] | undefined>(undefined);
  sizes = signal<Size[] | undefined>(undefined);
  tilePixelRatio = signal<number | undefined>(undefined);
  tileSize = signal<number | Size | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  version = signal<Versions | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolIIIFSourceComponent', () => {
  let fixture: ComponentFixture<TestIIIFSourceComponent>;
  let testComponent: TestIIIFSourceComponent;
  let component: WolIIIFSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let iiif: IIIF;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestIIIFSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestIIIFSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(WolIIIFSourceComponent)).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    iiif = component.getInstance() as IIIF;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the IIIF source', () => {
    expect(component).toBeTruthy();
    expect(iiif).toBeInstanceOf(IIIF);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(iiif);
  }));

  // --- Initialization (per input) ---

  it('should initialize with required wolSize', async () => {
    const inst = await createIIIFInstance((c) => c.size.set([256, 256]));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createIIIFInstance((c) => c.attributions.set('© IIIF'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolAttributionCollapsible = false', async () => {
    const inst = await createIIIFInstance((c) => c.attributionCollapsible.set(false));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createIIIFInstance((c) => c.cacheSize.set(256));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createIIIFInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolFormat', async () => {
    const inst = await createIIIFInstance((c) => c.format.set('jpg'));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createIIIFInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createIIIFInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolQuality', async () => {
    const inst = await createIIIFInstance((c) => c.quality.set('native'));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createIIIFInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolResolutions', async () => {
    const inst = await createIIIFInstance((c) => c.resolutions.set([256, 128, 64]));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolSizes', async () => {
    const inst = await createIIIFInstance((c) =>
      c.sizes.set([
        [512, 512],
        [256, 256],
      ]),
    );
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolTilePixelRatio', async () => {
    const inst = await createIIIFInstance((c) => c.tilePixelRatio.set(2));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolTileSize', async () => {
    const inst = await createIIIFInstance((c) => c.tileSize.set(512));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createIIIFInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createIIIFInstance((c) => c.url.set('https://example.com/iiif/image'));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolVersion', async () => {
    const inst = await createIIIFInstance((c) => c.version.set(Versions.version2));
    expect(inst).toBeInstanceOf(IIIF);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createIIIFInstance((c) => c.properties.set({ label: 'test-iiif' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-iiif' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(iiif, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(iiif, 'setUrl');
    testComponent.url.set('https://example.com/iiif/v2');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('https://example.com/iiif/v2');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(iiif, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    iiif.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    iiif.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    iiif.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    iiif.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    iiif.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    iiif.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(iiif);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
