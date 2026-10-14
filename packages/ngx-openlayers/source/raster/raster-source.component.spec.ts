import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import ImageLayer from 'ol/layer/Image';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import CanvasTileLayerRenderer from 'ol/renderer/canvas/TileLayer';
import { Source } from 'ol/source';
import DataTileSource from 'ol/source/DataTile';
import ImageTileSource from 'ol/source/ImageTile';
import RasterSource, { Operation, RasterOperationType } from 'ol/source/Raster';
import { AttributionLike } from 'ol/source/Source';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolDataTileSourceComponent } from '@workletjs/ngx-openlayers/source/data-tile';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolRasterSourceComponent } from './raster-source.component';

function makeXYZSource(): XYZ {
  return new XYZ({ url: 'https://tile.example.com/{z}/{x}/{y}.png' });
}

async function createRasterSourceInstance(
  setup?: (c: TestRasterSourceComponent) => void,
): Promise<RasterSource> {
  const f = TestBed.createComponent(TestRasterSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolRasterSourceComponent))
    .componentInstance.getInstance() as RasterSource;
}

@Component({
  selector: 'wol-test-raster-source',
  imports: [WolMapComponent, WolViewComponent, WolImageLayerComponent, WolRasterSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        @if (!destroySource()) {
          <wol-raster-source
            [wolSources]="sources()"
            [wolAttributions]="attributions()"
            [wolInterpolate]="interpolate()"
            [wolOperation]="operation()"
            [wolLib]="lib()"
            [wolThreads]="threads()"
            [wolOperationType]="operationType()"
            [wolResolutions]="resolutions()"
            [wolProperties]="properties()"
            (wolAfterOperations)="onAfterOperations($event)"
            (wolBeforeOperations)="onBeforeOperations($event)"
            (wolChange)="onChange($event)"
            (wolError)="onError($event)"
            (wolImageLoadEnd)="onImageLoadEnd($event)"
            (wolImageLoadError)="onImageLoadError($event)"
            (wolImageLoadStart)="onImageLoadStart($event)"
            (wolPropertyChange)="onPropertyChange($event)"
          />
        }
      </wol-image-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestRasterSourceComponent {
  sources = signal<Source[] | Layer[]>([makeXYZSource()]);
  attributions = signal<AttributionLike | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  operation = signal<Operation | undefined>(undefined);
  lib = signal<Record<string, WolSafeAny> | undefined>(undefined);
  threads = signal<number | undefined>(undefined);
  operationType = signal<RasterOperationType | undefined>(undefined);
  resolutions = signal<number[] | null | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onAfterOperations = vi.fn();
  onBeforeOperations = vi.fn();
  onChange = vi.fn();
  onError = vi.fn();
  onImageLoadEnd = vi.fn();
  onImageLoadError = vi.fn();
  onImageLoadStart = vi.fn();
  onPropertyChange = vi.fn();
}

describe('WolRasterSourceComponent', () => {
  let fixture: ComponentFixture<TestRasterSourceComponent>;
  let testComponent: TestRasterSourceComponent;
  let component: WolRasterSourceComponent;
  let imageLayerComponent: WolImageLayerComponent;
  let rasterSource: RasterSource;
  let olImageLayer: ImageLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestRasterSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestRasterSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolRasterSourceComponent),
    ).componentInstance;
    imageLayerComponent = fixture.debugElement.query(
      By.directive(WolImageLayerComponent),
    ).componentInstance;
    rasterSource = component.getInstance() as RasterSource;
    olImageLayer = imageLayerComponent.getInstance() as ImageLayer;
  });

  // --- Creation ---

  it('should create the Raster source', () => {
    expect(component).toBeTruthy();
    expect(rasterSource).toBeInstanceOf(RasterSource);
  });

  it('should register the source on the image layer', fakeAsync(() => {
    flush();
    expect(olImageLayer.getSource()).toBe(rasterSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createRasterSourceInstance((c) => c.attributions.set('© Raster'));
    expect(inst).toBeInstanceOf(RasterSource);
  });

  it('should default to interpolation when wolInterpolate is undefined', () => {
    expect(rasterSource.getInterpolate()).toBe(true);
  });

  it('should initialize with wolInterpolate = true', async () => {
    const inst = await createRasterSourceInstance((c) => c.interpolate.set(true));
    expect(inst.getInterpolate()).toBe(true);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createRasterSourceInstance((c) => c.interpolate.set(false));
    expect(inst.getInterpolate()).toBe(false);
  });

  it('should initialize with wolLib', async () => {
    const inst = await createRasterSourceInstance((c) =>
      c.lib.set({ myHelper: (x: number) => x * 2 }),
    );
    expect(inst).toBeInstanceOf(RasterSource);
  });

  it('should initialize with wolThreads', async () => {
    const inst = await createRasterSourceInstance((c) => c.threads.set(2));
    expect(inst).toBeInstanceOf(RasterSource);
  });

  it('should initialize with wolOperationType', async () => {
    const inst = await createRasterSourceInstance((c) => c.operationType.set('image'));
    expect(inst).toBeInstanceOf(RasterSource);
  });

  it('should initialize with wolResolutions', async () => {
    const inst = await createRasterSourceInstance((c) => c.resolutions.set([156543, 78271, 39135]));
    expect(inst).toBeInstanceOf(RasterSource);
  });

  it('should initialize with wolResolutions = null', async () => {
    const inst = await createRasterSourceInstance((c) => c.resolutions.set(null));
    expect(inst).toBeInstanceOf(RasterSource);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createRasterSourceInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(RasterSource);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(rasterSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update operation via ngOnChanges (wolOperation)', async () => {
    // RasterSource.setOperation() uses Web Workers; mock to avoid jsdom limitation
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const spy = vi.spyOn(rasterSource, 'setOperation').mockImplementation(() => {});
    const op: Operation = (pixels) => pixels[0];
    testComponent.operation.set(op);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(op, undefined);
  });

  it('should update resolutions via ngOnChanges (wolResolutions)', async () => {
    const spy = vi.spyOn(rasterSource, 'setResolutions');
    testComponent.resolutions.set([156543, 78271]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith([156543, 78271]);
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(rasterSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' }, false);
  });

  // --- addSource / removeSource ---

  it('should add a source via addSource()', () => {
    const source = makeXYZSource();
    expect(() => component.addSource(source)).not.toThrow();
  });

  it('should remove a source via removeSource()', () => {
    const source = makeXYZSource();
    component.addSource(source);
    expect(() => component.removeSource(source)).not.toThrow();
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    rasterSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    rasterSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    rasterSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolAfterOperations on afteroperations event', async () => {
    rasterSource.dispatchEvent('afteroperations');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onAfterOperations).toHaveBeenCalled();
  });

  it('should emit wolBeforeOperations on beforeoperations event', async () => {
    rasterSource.dispatchEvent('beforeoperations');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onBeforeOperations).toHaveBeenCalled();
  });

  it('should emit wolImageLoadEnd on imageloadend event', async () => {
    rasterSource.dispatchEvent('imageloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolImageLoadError on imageloaderror event', async () => {
    rasterSource.dispatchEvent('imageloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadError).toHaveBeenCalled();
  });

  it('should emit wolImageLoadStart on imageloadstart event', async () => {
    rasterSource.dispatchEvent('imageloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadStart).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(RasterSource);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
    expect(olImageLayer.getSource()).toBeNull();
    testComponent.onChange.mockClear();
    rasterSource.dispatchEvent('change');
    expect(testComponent.onChange).not.toHaveBeenCalled();
  });
});

const dataTileGrid = new TileGrid({
  extent: [0, 0, 2, 2],
  resolutions: [1],
  tileSize: 2,
});

function makeDataTileSource(value: number): DataTileSource {
  return new DataTileSource({
    loader: () => new Float32Array(4).fill(value),
    tileGrid: dataTileGrid,
    tileSize: 2,
    bandCount: 1,
    transition: 0,
  });
}

async function expectRasterData(raster: RasterSource, expected: number[][]): Promise<void> {
  raster.getImage([0, 0, 2, 2], 1, 1, getProjection('EPSG:3857') as Projection);
  await vi.waitFor(() => {
    raster.getImage([0, 0, 2, 2], 1, 1, getProjection('EPSG:3857') as Projection);
    expect(raster.getData([0.5, 1.5])).toEqual(expected);
  });
}

@Component({
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolImageLayerComponent,
    WolRasterSourceComponent,
    WolDataTileSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        <wol-raster-source [wolThreads]="0" [wolResolutions]="null">
          @for (source of sources(); track source.id) {
            <wol-data-tile-source
              [wolLoader]="source.loader"
              [wolTileGrid]="tileGrid"
              [wolTileSize]="2"
              [wolBandCount]="1"
              [wolTransition]="0"
            />
          }
        </wol-raster-source>
      </wol-image-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestRasterDataComponent {
  readonly tileGrid = dataTileGrid;
  readonly sources = signal<{ id: number; loader: () => Float32Array }[]>([]);
}

describe('WolRasterSourceComponent native data sampling', () => {
  let fixture: ComponentFixture<TestRasterDataComponent>;
  let component: WolRasterSourceComponent;
  let rasterSource: RasterSource;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestRasterDataComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestRasterDataComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    component = fixture.debugElement.query(
      By.directive(WolRasterSourceComponent),
    ).componentInstance;
    rasterSource = component.getInstance() as RasterSource;
  });

  afterEach(() => vi.restoreAllMocks());

  it('should preserve fractional band values after adding a source to an existing instance', async () => {
    component.addSource(makeDataTileSource(42.5));

    await expectRasterData(rasterSource, [[42.5]]);
    expect(component.getInstance()).toBe(rasterSource);
  });

  it('should keep source order and sampling aligned after removing the first source', async () => {
    const first = makeDataTileSource(42.5);
    const second = makeDataTileSource(7.25);
    component.addSource(first);
    component.addSource(second);

    await expectRasterData(rasterSource, [[42.5], [7.25]]);
    component.removeSource(first);
    await expectRasterData(rasterSource, [[7.25]]);
    expect(component.getInstance()).toBe(rasterSource);
  });

  it('should sample nested components and remove their data when they are destroyed', async () => {
    const first = { id: 1, loader: () => new Float32Array(4).fill(42.5) };
    const second = { id: 2, loader: () => new Float32Array(4).fill(7.25) };
    fixture.componentInstance.sources.set([first, second]);
    fixture.detectChanges();
    await fixture.whenStable();
    const child = fixture.debugElement.query(By.directive(WolDataTileSourceComponent))
      .componentInstance as WolDataTileSourceComponent;

    await expectRasterData(rasterSource, [[42.5], [7.25]]);
    fixture.componentInstance.sources.set([second]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(child.getInstance()).toBeUndefined();
    await expectRasterData(rasterSource, [[7.25]]);
    expect(component.getInstance()).toBe(rasterSource);

    fixture.componentInstance.sources.set([]);
    fixture.detectChanges();
    await fixture.whenStable();
    await expectRasterData(rasterSource, []);
  });

  it.each(['ImageTile source', 'Layer input'])(
    'should read rendered RGBA values for %s',
    async (inputType) => {
      // jsdom has no canvas: substitute only the rendered-pixel boundary. The Raster
      // sampling selection and public getImage/getData calls remain the real implementation.
      const rgba = new Uint8ClampedArray([42, 7, 0, 255]);
      vi.spyOn(CanvasTileLayerRenderer.prototype, 'prepareFrame').mockReturnValue(false);
      const renderedData = vi
        .spyOn(CanvasTileLayerRenderer.prototype, 'getData')
        .mockReturnValue(rgba);
      const nativeData = vi.spyOn(CanvasTileLayerRenderer.prototype, 'readData');
      const input =
        inputType === 'ImageTile source'
          ? new ImageTileSource({ url: 'https://tile.example.com/{z}/{x}/{y}.png' })
          : new TileLayer({ source: makeDataTileSource(42.5) });
      component.addSource(input);

      rasterSource.getImage([0, 0, 2, 2], 1, 1, getProjection('EPSG:3857') as Projection);
      expect(rasterSource.getData([0.5, 1.5])).toEqual([rgba]);
      expect(renderedData).toHaveBeenCalled();
      expect(nativeData).not.toHaveBeenCalled();
    },
  );
});
