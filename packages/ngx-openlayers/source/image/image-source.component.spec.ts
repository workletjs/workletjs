import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Loader } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';
import { AttributionLike, State } from 'ol/source/Source';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolImageSourceComponent } from './image-source.component';

async function createImageSourceInstance(
  setup?: (c: TestImageSourceComponent) => void,
): Promise<ImageSource> {
  const f = TestBed.createComponent(TestImageSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolImageSourceComponent))
    .componentInstance.getInstance() as ImageSource;
}

@Component({
  selector: 'wol-test-image-source',
  imports: [WolMapComponent, WolViewComponent, WolImageLayerComponent, WolImageSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        @if (!destroySource()) {
          <wol-image-source
            [wolAttributions]="attributions()"
            [wolInterpolate]="interpolate()"
            [wolLoader]="loader()"
            [wolProjection]="projection()"
            [wolResolutions]="resolutions()"
            [wolState]="state()"
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
class TestImageSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  loader = signal<Loader | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  resolutions = signal<number[] | undefined>(undefined);
  state = signal<State | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onImageLoadEnd = vi.fn();
  onImageLoadError = vi.fn();
  onImageLoadStart = vi.fn();
  onPropertyChange = vi.fn();
}

describe('WolImageSourceComponent', () => {
  let fixture: ComponentFixture<TestImageSourceComponent>;
  let testComponent: TestImageSourceComponent;
  let component: WolImageSourceComponent;
  let imageLayerComponent: WolImageLayerComponent;
  let imageSource: ImageSource;
  let olImageLayer: ImageLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestImageSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestImageSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(WolImageSourceComponent)).componentInstance;
    imageLayerComponent = fixture.debugElement.query(
      By.directive(WolImageLayerComponent),
    ).componentInstance;
    imageSource = component.getInstance() as ImageSource;
    olImageLayer = imageLayerComponent.getInstance() as ImageLayer;
  });

  // --- Creation ---

  it('should create the Image source', () => {
    expect(component).toBeTruthy();
    expect(imageSource).toBeInstanceOf(ImageSource);
  });

  it('should register the source on the image layer', fakeAsync(() => {
    flush();
    expect(olImageLayer.getSource()).toBe(imageSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createImageSourceInstance((c) => c.attributions.set('© Test'));
    expect(inst).toBeInstanceOf(ImageSource);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createImageSourceInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(ImageSource);
  });

  it('should initialize with wolLoader', async () => {
    const loader: Loader = vi.fn();
    const inst = await createImageSourceInstance((c) => c.loader.set(loader));
    expect(inst).toBeInstanceOf(ImageSource);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createImageSourceInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(ImageSource);
  });

  it('should initialize with wolResolutions', async () => {
    const inst = await createImageSourceInstance((c) => c.resolutions.set([156543, 78271, 39135]));
    expect(inst).toBeInstanceOf(ImageSource);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createImageSourceInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(ImageSource);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const setAttributionsSpy = vi.spyOn(imageSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setAttributionsSpy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const setPropertiesSpy = vi.spyOn(imageSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setPropertiesSpy).toHaveBeenCalledWith({ key: 'updated' }, true);
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    imageSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    imageSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    imageSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolImageLoadEnd on imageloadend event', async () => {
    imageSource.dispatchEvent('imageloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolImageLoadError on imageloaderror event', async () => {
    imageSource.dispatchEvent('imageloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadError).toHaveBeenCalled();
  });

  it('should emit wolImageLoadStart on imageloadstart event', async () => {
    imageSource.dispatchEvent('imageloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onImageLoadStart).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(ImageSource);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
