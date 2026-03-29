import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoadFunction } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import { AttributionLike } from 'ol/source/Source';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolImageStaticSourceComponent } from './image-static-source.component';

const DEFAULT_URL = 'https://example.com/image.png';
const DEFAULT_EXTENT: Extent = [-180, -90, 180, 90];

async function createImageStaticInstance(
  setup?: (c: TestImageStaticSourceComponent) => void,
): Promise<Static> {
  const f = TestBed.createComponent(TestImageStaticSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolImageStaticSourceComponent))
    .componentInstance.getInstance() as Static;
}

@Component({
  selector: 'wol-test-image-static-source',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolImageLayerComponent,
    WolImageStaticSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        @if (!destroySource()) {
          <wol-image-static-source
            [wolUrl]="url()"
            [wolImageExtent]="imageExtent()"
            [wolAttributions]="attributions()"
            [wolCrossOrigin]="crossOrigin()"
            [wolImageLoadFunction]="imageLoadFunction()"
            [wolInterpolate]="interpolate()"
            [wolProjection]="projection()"
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
class TestImageStaticSourceComponent {
  url = signal<string>(DEFAULT_URL);
  imageExtent = signal<Extent>(DEFAULT_EXTENT);
  attributions = signal<AttributionLike | undefined>(undefined);
  crossOrigin = signal<null | string | undefined>(undefined);
  imageLoadFunction = signal<LoadFunction | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
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

describe('WolImageStaticSourceComponent', () => {
  let fixture: ComponentFixture<TestImageStaticSourceComponent>;
  let testComponent: TestImageStaticSourceComponent;
  let component: WolImageStaticSourceComponent;
  let imageLayerComponent: WolImageLayerComponent;
  let staticSource: Static;
  let olImageLayer: ImageLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestImageStaticSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestImageStaticSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolImageStaticSourceComponent),
    ).componentInstance;
    imageLayerComponent = fixture.debugElement.query(
      By.directive(WolImageLayerComponent),
    ).componentInstance;
    staticSource = component.getInstance() as Static;
    olImageLayer = imageLayerComponent.getInstance() as ImageLayer;
  });

  // --- Creation ---

  it('should create the ImageStatic source', () => {
    expect(component).toBeTruthy();
    expect(staticSource).toBeInstanceOf(Static);
  });

  it('should register the source on the image layer', fakeAsync(() => {
    flush();
    expect(olImageLayer.getSource()).toBe(staticSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolUrl', async () => {
    const inst = await createImageStaticInstance((c) =>
      c.url.set('https://example.com/custom.png'),
    );
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolImageExtent', async () => {
    const inst = await createImageStaticInstance((c) => c.imageExtent.set([-100, -50, 100, 50]));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createImageStaticInstance((c) => c.attributions.set('© Static'));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createImageStaticInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createImageStaticInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolImageLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createImageStaticInstance((c) => c.imageLoadFunction.set(fn));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createImageStaticInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createImageStaticInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolReferrerPolicy', async () => {
    const inst = await createImageStaticInstance((c) => c.referrerPolicy.set('no-referrer'));
    expect(inst).toBeInstanceOf(Static);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createImageStaticInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(Static);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(staticSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(staticSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' }, false);
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    staticSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    staticSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    staticSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolImageLoadEnd on imageloadend event', async () => {
    staticSource.dispatchEvent('imageloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolImageLoadError on imageloaderror event', async () => {
    staticSource.dispatchEvent('imageloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadError).toHaveBeenCalled();
  });

  it('should emit wolImageLoadStart on imageloadstart event', async () => {
    staticSource.dispatchEvent('imageloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadStart).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(Static);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
