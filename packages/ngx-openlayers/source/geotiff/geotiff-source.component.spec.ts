import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import OlObservable from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import { GeoTIFFSourceOptions, SourceInfo } from 'ol/source/GeoTIFF';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolWebGLTileLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolGeoTIFFSourceComponent } from './geotiff-source.component';

/**
 * GeoTIFFSource creates web workers internally which are unsupported in jsdom.
 * We replace the module with a lightweight fake that extends OL Observable so
 * event dispatching (for output testing) and method-call assertions work.
 */
vi.mock('ol/source/GeoTIFF', async () => {
  const { default: Observable } =
    await vi.importActual<typeof import('ol/Observable')>('ol/Observable');

  class FakeGeoTIFFSource extends Observable {
    readonly constructorOptions: Record<string, unknown>;
    setAttributions = vi.fn();
    setProperties = vi.fn();

    constructor(options: Record<string, unknown>) {
      super();
      this.constructorOptions = options;
    }

    getProperties() {
      return {};
    }

    getState() {
      return 'ready';
    }
  }

  return { default: FakeGeoTIFFSource };
});

type FakeSource = OlObservable & {
  constructorOptions: Record<string, unknown>;
  setAttributions: ReturnType<typeof vi.fn>;
  setProperties: ReturnType<typeof vi.fn>;
};

describe('WolGeoTIFFSourceComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testComponent: TestHostComponent;
  let webglTileLayerComponent: WolWebGLTileLayerComponent;
  let geotiffSourceComponent: WolGeoTIFFSourceComponent;
  let geotiffSource: FakeSource;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    webglTileLayerComponent = fixture.debugElement.query(
      By.directive(WolWebGLTileLayerComponent),
    ).componentInstance;
    geotiffSourceComponent = fixture.debugElement.query(
      By.directive(WolGeoTIFFSourceComponent),
    ).componentInstance;
    geotiffSource = geotiffSourceComponent.getInstance() as unknown as FakeSource;
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('should create the GeoTIFF source component', () => {
    expect(geotiffSourceComponent).toBeTruthy();
    expect(geotiffSource).toBeDefined();
    expect(geotiffSource).toBeInstanceOf(OlObservable);
  });

  it('should register the source on the WebGL tile layer', () => {
    expect(webglTileLayerComponent.getInstance()?.getSource()).toBe(geotiffSource);
  });

  // ── Init inputs ───────────────────────────────────────────────────────────

  it('should initialize with wolSources', () => {
    expect(geotiffSource.constructorOptions['sources']).toBe(testComponent.sources());
  });

  it('should initialize with wolAttributions', () => {
    expect(geotiffSource.constructorOptions['attributions']).toBe(testComponent.attributions());
  });

  it('should initialize with wolSourceOptions', () => {
    expect(geotiffSource.constructorOptions['sourceOptions']).toBe(testComponent.sourceOptions());
  });

  it('should initialize with wolConvertToRGB', () => {
    expect(geotiffSource.constructorOptions['convertToRGB']).toBe(testComponent.convertToRGB());
  });

  it('should initialize with wolNormalize', () => {
    expect(geotiffSource.constructorOptions['normalize']).toBe(testComponent.normalize());
  });

  it('should initialize with wolProjection', () => {
    expect(geotiffSource.constructorOptions['projection']).toBe(testComponent.projection());
  });

  it('should initialize with wolTransition', () => {
    expect(geotiffSource.constructorOptions['transition']).toBe(testComponent.transition());
  });

  it('should initialize with wolWrapX', () => {
    expect(geotiffSource.constructorOptions['wrapX']).toBe(testComponent.wrapX());
  });

  it('should initialize with wolInterpolate', () => {
    expect(geotiffSource.constructorOptions['interpolate']).toBe(testComponent.interpolate());
  });

  it('should call setProperties with wolProperties on initialization', () => {
    expect(geotiffSource.setProperties).toHaveBeenCalledWith(testComponent.properties(), true);
  });

  // ── Input changes ─────────────────────────────────────────────────────────

  it('should update attributions when wolAttributions input changes', () => {
    const newAttributions = 'Updated attribution';
    testComponent.attributions.set(newAttributions);
    fixture.detectChanges();
    expect(geotiffSource.setAttributions).toHaveBeenCalledWith(newAttributions);
  });

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(geotiffSource.setProperties).toHaveBeenCalledWith(newProperties);
  });

  // ── Outputs ───────────────────────────────────────────────────────────────

  it('should emit wolChange when the source fires a change event', () => {
    const changeSpy = vi.spyOn(geotiffSourceComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    geotiffSource.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const errorSpy = vi.spyOn(geotiffSourceComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    geotiffSource.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(geotiffSourceComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'opacity', 0.5);
    geotiffSource.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const tileLoadEndSpy = vi.spyOn(geotiffSourceComponent.wolTileLoadEnd, 'emit');
    const event = new BaseEvent('tileloadend') as unknown as TileSourceEvent;
    geotiffSource.dispatchEvent(event);
    expect(tileLoadEndSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const tileLoadErrorSpy = vi.spyOn(geotiffSourceComponent.wolTileLoadError, 'emit');
    const event = new BaseEvent('tileloaderror') as unknown as TileSourceEvent;
    geotiffSource.dispatchEvent(event);
    expect(tileLoadErrorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const tileLoadStartSpy = vi.spyOn(geotiffSourceComponent.wolTileLoadStart, 'emit');
    const event = new BaseEvent('tileloadstart') as unknown as TileSourceEvent;
    geotiffSource.dispatchEvent(event);
    expect(tileLoadStartSpy).toHaveBeenCalledWith(event);
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  it('should remove the source from the WebGL tile layer and clear instance when destroyed', async () => {
    const webglInstance = webglTileLayerComponent.getInstance();
    if (!webglInstance) throw new Error('WebGL tile layer instance not found');
    const setSourceSpy = vi.spyOn(webglInstance, 'setSource');
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(geotiffSourceComponent.getInstance()).toBeUndefined();
    expect(setSourceSpy).toHaveBeenCalledWith(null);
  });
});

@Component({
  selector: 'wol-test-geotiff-host',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolWebGLTileLayerComponent,
    WolGeoTIFFSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-webgl-tile-layer>
        @if (!destroySource()) {
          <wol-geotiff-source
            [wolSources]="sources()"
            [wolAttributions]="attributions()"
            [wolSourceOptions]="sourceOptions()"
            [wolConvertToRGB]="convertToRGB()"
            [wolNormalize]="normalize()"
            [wolProjection]="projection()"
            [wolTransition]="transition()"
            [wolWrapX]="wrapX()"
            [wolInterpolate]="interpolate()"
            [wolProperties]="properties()"
          />
        }
      </wol-webgl-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  sources = signal<SourceInfo[]>([{ url: 'https://example.com/test.tif' }]);
  attributions = signal<AttributionLike>('© Test');
  sourceOptions = signal<GeoTIFFSourceOptions>({ allowFullFile: true });
  convertToRGB = signal<boolean | 'auto'>(true);
  normalize = signal(false);
  projection = signal<string>('EPSG:4326');
  transition = signal(250);
  wrapX = signal(false);
  interpolate = signal(true);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroySource = signal(false);
}
