import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoadFunction } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import ImageLayer from 'ol/layer/Image';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
import { AttributionLike } from 'ol/source/Source';

import { WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolImageArcGISResetSourceComponent } from './image-arcgis-reset-source.component';

async function createImageArcGISResetInstance(
  setup?: (c: TestImageArcGISResetSourceComponent) => void,
): Promise<ImageArcGISRest> {
  const f = TestBed.createComponent(TestImageArcGISResetSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolImageArcGISResetSourceComponent))
    .componentInstance.getInstance() as ImageArcGISRest;
}

@Component({
  selector: 'wol-test-image-arcgis-reset-source',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolImageLayerComponent,
    WolImageArcGISResetSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        @if (!destroySource()) {
          <wol-image-arcgis-reset-source
            [wolAttributions]="attributions()"
            [wolCrossOrigin]="crossOrigin()"
            [wolHidpi]="hidpi()"
            [wolImageLoadFunction]="imageLoadFunction()"
            [wolInterpolate]="interpolate()"
            [wolParams]="params()"
            [wolProjection]="projection()"
            [wolRatio]="ratio()"
            [wolResolutions]="resolutions()"
            [wolUrl]="url()"
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
class TestImageArcGISResetSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  crossOrigin = signal<null | string | undefined>(undefined);
  hidpi = signal<boolean | undefined>(undefined);
  imageLoadFunction = signal<LoadFunction | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  params = signal<{ [key: string]: WolSafeAny } | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  ratio = signal<number | undefined>(undefined);
  resolutions = signal<number[] | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onImageLoadEnd = vi.fn();
  onImageLoadError = vi.fn();
  onImageLoadStart = vi.fn();
  onPropertyChange = vi.fn();
}

describe('WolImageArcGISResetSourceComponent', () => {
  let fixture: ComponentFixture<TestImageArcGISResetSourceComponent>;
  let testComponent: TestImageArcGISResetSourceComponent;
  let component: WolImageArcGISResetSourceComponent;
  let imageLayerComponent: WolImageLayerComponent;
  let imageArcGIS: ImageArcGISRest;
  let olImageLayer: ImageLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestImageArcGISResetSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestImageArcGISResetSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolImageArcGISResetSourceComponent),
    ).componentInstance;
    imageLayerComponent = fixture.debugElement.query(
      By.directive(WolImageLayerComponent),
    ).componentInstance;
    imageArcGIS = component.getInstance() as ImageArcGISRest;
    olImageLayer = imageLayerComponent.getInstance() as ImageLayer;
  });

  // --- Creation ---

  it('should create the ImageArcGISRest source', () => {
    expect(component).toBeTruthy();
    expect(imageArcGIS).toBeInstanceOf(ImageArcGISRest);
  });

  it('should register the source on the image layer', fakeAsync(() => {
    flush();
    expect(olImageLayer.getSource()).toBe(imageArcGIS);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.attributions.set('© ArcGIS'));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolHidpi = false', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.hidpi.set(false));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolImageLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createImageArcGISResetInstance((c) => c.imageLoadFunction.set(fn));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolParams', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.params.set({ LAYERS: 'show:0' }));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolRatio', async () => {
    const inst = await createImageArcGISResetInstance((c) => c.ratio.set(1.5));
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolResolutions', async () => {
    const inst = await createImageArcGISResetInstance((c) =>
      c.resolutions.set([156543, 78271, 39135]),
    );
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createImageArcGISResetInstance((c) =>
      c.url.set('https://arcgis.example.com/rest/services/Map/MapServer'),
    );
    expect(inst).toBeInstanceOf(ImageArcGISRest);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(imageArcGIS, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update imageLoadFunction via ngOnChanges (wolImageLoadFunction)', async () => {
    const spy = vi.spyOn(imageArcGIS, 'setImageLoadFunction');
    const fn: LoadFunction = vi.fn();
    testComponent.imageLoadFunction.set(fn);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update params via ngOnChanges (wolParams)', async () => {
    const spy = vi.spyOn(imageArcGIS, 'setParams');
    testComponent.params.set({ LAYERS: 'show:1' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ LAYERS: 'show:1' });
  });

  it('should update url via ngOnChanges (wolUrl)', async () => {
    const spy = vi.spyOn(imageArcGIS, 'setUrl');
    testComponent.url.set('https://new.example.com/rest/services/Map/MapServer');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('https://new.example.com/rest/services/Map/MapServer');
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    imageArcGIS.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    imageArcGIS.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    imageArcGIS.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolImageLoadEnd on imageloadend event', async () => {
    imageArcGIS.dispatchEvent('imageloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolImageLoadError on imageloaderror event', async () => {
    imageArcGIS.dispatchEvent('imageloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadError).toHaveBeenCalled();
  });

  it('should emit wolImageLoadStart on imageloadstart event', async () => {
    imageArcGIS.dispatchEvent('imageloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadStart).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(ImageArcGISRest);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
