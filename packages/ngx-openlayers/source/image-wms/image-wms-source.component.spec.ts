import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoadFunction } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { AttributionLike } from 'ol/source/Source';
import { ServerType } from 'ol/source/wms';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolImageWMSSourceComponent } from './image-wms-source.component';

async function createImageWMSInstance(
  setup?: (c: TestImageWMSSourceComponent) => void,
): Promise<ImageWMS> {
  const f = TestBed.createComponent(TestImageWMSSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolImageWMSSourceComponent))
    .componentInstance.getInstance() as ImageWMS;
}

@Component({
  selector: 'wol-test-image-wms-source',
  imports: [WolMapComponent, WolViewComponent, WolImageLayerComponent, WolImageWMSSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        @if (!destroySource()) {
          <wol-image-wms-source
            [wolAttributions]="attributions()"
            [wolCrossOrigin]="crossOrigin()"
            [wolHidpi]="hidpi()"
            [wolServerType]="serverType()"
            [wolImageLoadFunction]="imageLoadFunction()"
            [wolInterpolate]="interpolate()"
            [wolParams]="params()"
            [wolProjection]="projection()"
            [wolRatio]="ratio()"
            [wolResolutions]="resolutions()"
            [wolUrl]="url()"
            [wolReferrerPolicy]="referrerPolicy()"
            [wolProperties]="properties()"
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
class TestImageWMSSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  crossOrigin = signal<null | string | undefined>(undefined);
  hidpi = signal<boolean | undefined>(undefined);
  serverType = signal<ServerType | undefined>(undefined);
  imageLoadFunction = signal<LoadFunction | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  params = signal<{ [key: string]: WolSafeAny } | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  ratio = signal<number | undefined>(undefined);
  resolutions = signal<number[] | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  referrerPolicy = signal<ReferrerPolicy | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onImageLoadEnd = vi.fn();
  onImageLoadError = vi.fn();
  onImageLoadStart = vi.fn();
  onPropertyChange = vi.fn();
}

describe('WolImageWMSSourceComponent', () => {
  let fixture: ComponentFixture<TestImageWMSSourceComponent>;
  let testComponent: TestImageWMSSourceComponent;
  let component: WolImageWMSSourceComponent;
  let imageLayerComponent: WolImageLayerComponent;
  let imageWMS: ImageWMS;
  let olImageLayer: ImageLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestImageWMSSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestImageWMSSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolImageWMSSourceComponent),
    ).componentInstance;
    imageLayerComponent = fixture.debugElement.query(
      By.directive(WolImageLayerComponent),
    ).componentInstance;
    imageWMS = component.getInstance() as ImageWMS;
    olImageLayer = imageLayerComponent.getInstance() as ImageLayer;
  });

  // --- Creation ---

  it('should create the ImageWMS source', () => {
    expect(component).toBeTruthy();
    expect(imageWMS).toBeInstanceOf(ImageWMS);
  });

  it('should register the source on the image layer', fakeAsync(() => {
    flush();
    expect(olImageLayer.getSource()).toBe(imageWMS);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createImageWMSInstance((c) => c.attributions.set('© WMS'));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createImageWMSInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createImageWMSInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolHidpi = false', async () => {
    const inst = await createImageWMSInstance((c) => c.hidpi.set(false));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolServerType', async () => {
    const inst = await createImageWMSInstance((c) => c.serverType.set('geoserver'));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolImageLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createImageWMSInstance((c) => c.imageLoadFunction.set(fn));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createImageWMSInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolParams', async () => {
    const inst = await createImageWMSInstance((c) =>
      c.params.set({ LAYERS: 'my_layer', FORMAT: 'image/png' }),
    );
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createImageWMSInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolRatio', async () => {
    const inst = await createImageWMSInstance((c) => c.ratio.set(1.5));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolResolutions', async () => {
    const inst = await createImageWMSInstance((c) => c.resolutions.set([156543, 78271, 39135]));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createImageWMSInstance((c) => c.url.set('https://wms.example.com/service'));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolReferrerPolicy', async () => {
    const inst = await createImageWMSInstance((c) => c.referrerPolicy.set('no-referrer'));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createImageWMSInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(ImageWMS);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(imageWMS, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update imageLoadFunction via ngOnChanges (wolImageLoadFunction)', async () => {
    const spy = vi.spyOn(imageWMS, 'setImageLoadFunction');
    const fn: LoadFunction = vi.fn();
    testComponent.imageLoadFunction.set(fn);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update params via ngOnChanges (wolParams)', async () => {
    const spy = vi.spyOn(imageWMS, 'setParams');
    testComponent.params.set({ LAYERS: 'updated_layer' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ LAYERS: 'updated_layer' });
  });

  it('should update url via ngOnChanges (wolUrl)', async () => {
    const spy = vi.spyOn(imageWMS, 'setUrl');
    testComponent.url.set('https://new-wms.example.com/service');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('https://new-wms.example.com/service');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(imageWMS, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' }, false);
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    imageWMS.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    imageWMS.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    imageWMS.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolImageLoadEnd on imageloadend event', async () => {
    imageWMS.dispatchEvent('imageloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolImageLoadError on imageloaderror event', async () => {
    imageWMS.dispatchEvent('imageloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadError).toHaveBeenCalled();
  });

  it('should emit wolImageLoadStart on imageloadstart event', async () => {
    imageWMS.dispatchEvent('imageloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadStart).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(ImageWMS);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
