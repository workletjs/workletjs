import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoadFunction } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import ImageLayer from 'ol/layer/Image';
import ImageMapGuide from 'ol/source/ImageMapGuide';
import { AttributionLike } from 'ol/source/Source';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolImageMapGuideSourceComponent } from './image-map-guide-source.component';

async function createImageMapGuideInstance(
  setup?: (c: TestImageMapGuideSourceComponent) => void,
): Promise<ImageMapGuide> {
  const f = TestBed.createComponent(TestImageMapGuideSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolImageMapGuideSourceComponent))
    .componentInstance.getInstance() as ImageMapGuide;
}

@Component({
  selector: 'wol-test-image-map-guide-source',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolImageLayerComponent,
    WolImageMapGuideSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        @if (!destroySource()) {
          <wol-image-map-guide-source
            [wolUrl]="url()"
            [wolAttributions]="attributions()"
            [wolCrossOrigin]="crossOrigin()"
            [wolDisplayDpi]="displayDpi()"
            [wolMetersPerUnit]="metersPerUnit()"
            [wolHidpi]="hidpi()"
            [wolUseOverlay]="useOverlay()"
            [wolProjection]="projection()"
            [wolRatio]="ratio()"
            [wolResolutions]="resolutions()"
            [wolImageLoadFunction]="imageLoadFunction()"
            [wolInterpolate]="interpolate()"
            [wolParams]="params()"
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
class TestImageMapGuideSourceComponent {
  url = signal<string | undefined>('https://mapguide.example.com/mapagent/mapagent.fcgi');
  attributions = signal<AttributionLike | undefined>(undefined);
  crossOrigin = signal<null | string | undefined>(undefined);
  displayDpi = signal<number | undefined>(undefined);
  metersPerUnit = signal<number | undefined>(undefined);
  hidpi = signal<boolean | undefined>(undefined);
  useOverlay = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  ratio = signal<number | undefined>(undefined);
  resolutions = signal<number[] | undefined>(undefined);
  imageLoadFunction = signal<LoadFunction | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  params = signal<{ [key: string]: WolSafeAny } | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onImageLoadEnd = vi.fn();
  onImageLoadError = vi.fn();
  onImageLoadStart = vi.fn();
  onPropertyChange = vi.fn();
}

describe('WolImageMapGuideSourceComponent', () => {
  let fixture: ComponentFixture<TestImageMapGuideSourceComponent>;
  let testComponent: TestImageMapGuideSourceComponent;
  let component: WolImageMapGuideSourceComponent;
  let imageLayerComponent: WolImageLayerComponent;
  let imageMapGuide: ImageMapGuide;
  let olImageLayer: ImageLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestImageMapGuideSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestImageMapGuideSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolImageMapGuideSourceComponent),
    ).componentInstance;
    imageLayerComponent = fixture.debugElement.query(
      By.directive(WolImageLayerComponent),
    ).componentInstance;
    imageMapGuide = component.getInstance() as ImageMapGuide;
    olImageLayer = imageLayerComponent.getInstance() as ImageLayer;
  });

  // --- Creation ---

  it('should create the ImageMapGuide source', () => {
    expect(component).toBeTruthy();
    expect(imageMapGuide).toBeInstanceOf(ImageMapGuide);
  });

  it('should register the source on the image layer', fakeAsync(() => {
    flush();
    expect(olImageLayer.getSource()).toBe(imageMapGuide);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolUrl', async () => {
    const inst = await createImageMapGuideInstance((c) =>
      c.url.set('https://mapguide.example.com/mapagent/mapagent.fcgi'),
    );
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createImageMapGuideInstance((c) => c.attributions.set('© MapGuide'));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createImageMapGuideInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createImageMapGuideInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolDisplayDpi', async () => {
    const inst = await createImageMapGuideInstance((c) => c.displayDpi.set(96));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolMetersPerUnit', async () => {
    const inst = await createImageMapGuideInstance((c) => c.metersPerUnit.set(1));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolHidpi = false', async () => {
    const inst = await createImageMapGuideInstance((c) => c.hidpi.set(false));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolUseOverlay = true', async () => {
    const inst = await createImageMapGuideInstance((c) => c.useOverlay.set(true));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createImageMapGuideInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolRatio', async () => {
    const inst = await createImageMapGuideInstance((c) => c.ratio.set(1.5));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolResolutions', async () => {
    const inst = await createImageMapGuideInstance((c) =>
      c.resolutions.set([156543, 78271, 39135]),
    );
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolImageLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createImageMapGuideInstance((c) => c.imageLoadFunction.set(fn));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createImageMapGuideInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolParams', async () => {
    const inst = await createImageMapGuideInstance((c) =>
      c.params.set({ MAPDEFINITION: 'Library://Map.MapDefinition' }),
    );
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createImageMapGuideInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(ImageMapGuide);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(imageMapGuide, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update imageLoadFunction via ngOnChanges (wolImageLoadFunction)', async () => {
    const spy = vi.spyOn(imageMapGuide, 'setImageLoadFunction');
    const fn: LoadFunction = vi.fn();
    testComponent.imageLoadFunction.set(fn);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update params via ngOnChanges (wolParams)', async () => {
    const spy = vi.spyOn(imageMapGuide, 'setParams');
    testComponent.params.set({ MAPDEFINITION: 'Library://NewMap.MapDefinition' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ MAPDEFINITION: 'Library://NewMap.MapDefinition' });
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(imageMapGuide, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' }, true);
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    imageMapGuide.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    imageMapGuide.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    imageMapGuide.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolImageLoadEnd on imageloadend event', async () => {
    imageMapGuide.dispatchEvent('imageloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolImageLoadError on imageloaderror event', async () => {
    imageMapGuide.dispatchEvent('imageloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadError).toHaveBeenCalled();
  });

  it('should emit wolImageLoadStart on imageloadstart event', async () => {
    imageMapGuide.dispatchEvent('imageloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadStart).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(ImageMapGuide);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
