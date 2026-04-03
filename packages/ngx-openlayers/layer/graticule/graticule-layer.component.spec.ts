import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import Graticule from 'ol/layer/Graticule';
import RenderEvent from 'ol/render/Event';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolGraticuleLayerComponent } from './graticule-layer.component';

const lonFormatter = (lon: number) => `lon-${lon}`;
const latFormatter = (lat: number) => `lat-${lat}`;

describe('WolGraticuleLayerComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestGraticuleLayerComponent>;
  let testComponent: TestGraticuleLayerComponent;
  let mapInstance: Map;
  let graticuleLayerComponent: WolGraticuleLayerComponent;
  let graticuleLayer: Graticule;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestGraticuleLayerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const graticuleLayerDebugElement = fixture.debugElement.query(
      By.directive(WolGraticuleLayerComponent),
    );

    testComponent = fixture.componentInstance;
    mapInstance = mapDebugElement.componentInstance.getInstance() as Map;
    graticuleLayerComponent = graticuleLayerDebugElement.componentInstance;
    graticuleLayer = graticuleLayerComponent.getInstance() as Graticule;
  });

  // ─── initialization ───────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should create the component', () => {
      expect(graticuleLayerComponent).toBeTruthy();
    });

    it('should create a Graticule OL instance', () => {
      expect(graticuleLayer).toBeInstanceOf(Graticule);
    });

    it('should expose the OL instance via getInstance()', () => {
      expect(graticuleLayerComponent.getInstance()).toBe(graticuleLayer);
    });

    it('should register the layer on the parent map', () => {
      expect(mapInstance.getLayers().getArray()).toContain(graticuleLayer);
    });
  });

  // ─── input initialization ─────────────────────────────────────────────────

  describe('input initialization', () => {
    it('should initialize wolClassName', () => {
      expect(graticuleLayer.getClassName()).toBe('custom-graticule');
    });

    it('should initialize wolOpacity', () => {
      expect(graticuleLayer.getOpacity()).toBe(0.5);
    });

    it('should initialize wolVisible to false', () => {
      expect(graticuleLayer.getVisible()).toBe(false);
    });

    it('should initialize wolExtent', () => {
      expect(graticuleLayer.getExtent()).toEqual([0, 1, 2, 3]);
    });

    it('should initialize wolZIndex', () => {
      expect(graticuleLayer.getZIndex()).toBe(5);
    });

    it('should initialize wolMinResolution', () => {
      expect(graticuleLayer.getMinResolution()).toBe(0.5);
    });

    it('should initialize wolMaxResolution', () => {
      expect(graticuleLayer.getMaxResolution()).toBe(10);
    });

    it('should initialize wolMinZoom', () => {
      expect(graticuleLayer.getMinZoom()).toBe(2);
    });

    it('should initialize wolMaxZoom', () => {
      expect(graticuleLayer.getMaxZoom()).toBe(9);
    });

    it('should initialize wolMaxLines', () => {
      expect(internals(graticuleLayer)['maxLines_']).toBe(12);
    });

    it('should initialize wolStrokeStyle', () => {
      expect(internals(graticuleLayer)['strokeStyle_']).toBe(testComponent.strokeStyle());
    });

    it('should initialize wolTargetSize', () => {
      expect(internals(graticuleLayer)['targetSize_']).toBe(240);
    });

    it('should not register label formatters when wolShowLabels is false', () => {
      // showLabels defaults to false in TestGraticuleLayerComponent;
      // OL only creates formatter fields when showLabels=true.
      expect(internals(graticuleLayer)['lonLabelFormatter_']).toBeUndefined();
      expect(internals(graticuleLayer)['latLabelFormatter_']).toBeUndefined();
    });

    describe('with showLabels = true', () => {
      let showLabelsFixture: ComponentFixture<TestGraticuleLayerWithShowLabelsComponent>;
      let showLabelsGraticuleLayer: Graticule;

      beforeEach(async () => {
        showLabelsFixture = TestBed.createComponent(TestGraticuleLayerWithShowLabelsComponent);
        showLabelsFixture.detectChanges();
        await showLabelsFixture.whenStable();
        showLabelsFixture.detectChanges();

        const dbgEl = showLabelsFixture.debugElement.query(
          By.directive(WolGraticuleLayerComponent),
        );
        showLabelsGraticuleLayer = dbgEl.componentInstance.getInstance() as Graticule;
      });

      it('should initialize wolLonLabelFormatter', () => {
        expect(internals(showLabelsGraticuleLayer)['lonLabelFormatter_']).toBe(lonFormatter);
      });

      it('should initialize wolLatLabelFormatter', () => {
        expect(internals(showLabelsGraticuleLayer)['latLabelFormatter_']).toBe(latFormatter);
      });

      it('should initialize wolLonLabelPosition', () => {
        expect(internals(showLabelsGraticuleLayer)['lonLabelPosition_']).toBe(0.2);
      });

      it('should initialize wolLatLabelPosition', () => {
        expect(internals(showLabelsGraticuleLayer)['latLabelPosition_']).toBe(0.8);
      });
    });

    it('should initialize wolIntervals', () => {
      expect(internals(graticuleLayer)['intervals_']).toEqual([30, 10]);
    });

    it('should initialize wolWrapX', () => {
      expect(internals(graticuleLayer)['values_']['wrapX']).toBe(false);
    });

    it('should initialize wolProperties', () => {
      expect(graticuleLayer.getProperties()).toMatchObject({ foo: 'bar' });
    });
  });

  // ─── model: wolOpacity ───────────────────────────────────────────────────

  describe('model: wolOpacity', () => {
    it('should update OL opacity when wolOpacity signal changes', () => {
      testComponent.opacity.set(0.8);
      fixture.detectChanges();
      expect(graticuleLayer.getOpacity()).toBe(0.8);
    });

    it('should update wolOpacity signal when OL fires change:opacity', async () => {
      graticuleLayer.setOpacity(0.2);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.opacity()).toBe(0.2);
    });

    it('should handle opacity boundary value 0', () => {
      testComponent.opacity.set(0);
      fixture.detectChanges();
      expect(graticuleLayer.getOpacity()).toBe(0);
    });

    it('should handle opacity boundary value 1', () => {
      testComponent.opacity.set(1);
      fixture.detectChanges();
      expect(graticuleLayer.getOpacity()).toBe(1);
    });
  });

  // ─── model: wolVisible ───────────────────────────────────────────────────

  describe('model: wolVisible', () => {
    it('should update OL visible when wolVisible signal changes to true', () => {
      testComponent.visible.set(true);
      fixture.detectChanges();
      expect(graticuleLayer.getVisible()).toBe(true);
    });

    it('should update wolVisible signal when OL fires change:visible', async () => {
      graticuleLayer.setVisible(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.visible()).toBe(true);
    });

    it('should update wolVisible signal back to false when OL sets visible to false', async () => {
      graticuleLayer.setVisible(true);
      graticuleLayer.setVisible(false);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.visible()).toBe(false);
    });
  });

  // ─── model: wolExtent ────────────────────────────────────────────────────

  describe('model: wolExtent', () => {
    it('should update OL extent when wolExtent signal changes', () => {
      const newExtent: Extent = [10, 20, 30, 40];
      testComponent.extent.set(newExtent);
      fixture.detectChanges();
      expect(graticuleLayer.getExtent()).toEqual(newExtent);
    });

    it('should update wolExtent signal when OL fires change:extent', async () => {
      const newExtent: Extent = [5, 10, 15, 20];
      graticuleLayer.setExtent(newExtent);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.extent()).toEqual(newExtent);
    });
  });

  // ─── model: wolZIndex ────────────────────────────────────────────────────

  describe('model: wolZIndex', () => {
    it('should update OL zIndex when wolZIndex signal changes', () => {
      testComponent.zIndex.set(10);
      fixture.detectChanges();
      expect(graticuleLayer.getZIndex()).toBe(10);
    });

    it('should update wolZIndex signal when OL fires change:zIndex', async () => {
      graticuleLayer.setZIndex(20);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.zIndex()).toBe(20);
    });

    it('should handle negative zIndex', () => {
      testComponent.zIndex.set(-1);
      fixture.detectChanges();
      expect(graticuleLayer.getZIndex()).toBe(-1);
    });
  });

  // ─── model: wolMinResolution ─────────────────────────────────────────────

  describe('model: wolMinResolution', () => {
    it('should update OL minResolution when wolMinResolution signal changes', () => {
      testComponent.minResolution.set(1.5);
      fixture.detectChanges();
      expect(graticuleLayer.getMinResolution()).toBe(1.5);
    });

    it('should update wolMinResolution signal when OL fires change:minResolution', async () => {
      graticuleLayer.setMinResolution(0.25);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.minResolution()).toBe(0.25);
    });
  });

  // ─── model: wolMaxResolution ─────────────────────────────────────────────

  describe('model: wolMaxResolution', () => {
    it('should update OL maxResolution when wolMaxResolution signal changes', () => {
      testComponent.maxResolution.set(25);
      fixture.detectChanges();
      expect(graticuleLayer.getMaxResolution()).toBe(25);
    });

    it('should update wolMaxResolution signal when OL fires change:maxResolution', async () => {
      graticuleLayer.setMaxResolution(50);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.maxResolution()).toBe(50);
    });
  });

  // ─── model: wolMinZoom ───────────────────────────────────────────────────

  describe('model: wolMinZoom', () => {
    it('should update OL minZoom when wolMinZoom signal changes', () => {
      testComponent.minZoom.set(3);
      fixture.detectChanges();
      expect(graticuleLayer.getMinZoom()).toBe(3);
    });

    it('should update wolMinZoom signal when OL fires change:minZoom', async () => {
      graticuleLayer.setMinZoom(1);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.minZoom()).toBe(1);
    });
  });

  // ─── model: wolMaxZoom ───────────────────────────────────────────────────

  describe('model: wolMaxZoom', () => {
    it('should update OL maxZoom when wolMaxZoom signal changes', () => {
      testComponent.maxZoom.set(15);
      fixture.detectChanges();
      expect(graticuleLayer.getMaxZoom()).toBe(15);
    });

    it('should update wolMaxZoom signal when OL fires change:maxZoom', async () => {
      graticuleLayer.setMaxZoom(18);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.maxZoom()).toBe(18);
    });
  });

  // ─── ngOnChanges ─────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should call setExtent when wolExtent changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setExtent');
      const newExtent: Extent = [100, 200, 300, 400];
      testComponent.extent.set(newExtent);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(newExtent);
    });

    it('should call setMaxResolution when wolMaxResolution changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setMaxResolution');
      testComponent.maxResolution.set(50);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(50);
    });

    it('should call setMaxZoom when wolMaxZoom changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setMaxZoom');
      testComponent.maxZoom.set(12);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(12);
    });

    it('should call setMinResolution when wolMinResolution changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setMinResolution');
      testComponent.minResolution.set(1.0);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(1.0);
    });

    it('should call setMinZoom when wolMinZoom changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setMinZoom');
      testComponent.minZoom.set(4);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(4);
    });

    it('should call setOpacity when wolOpacity changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setOpacity');
      testComponent.opacity.set(0.9);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(0.9);
    });

    it('should call setProperties when wolProperties changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setProperties');
      testComponent.properties.set({ updated: true });
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith({ updated: true });
    });

    it('should call setProperties with empty object when wolProperties is set to undefined', () => {
      const spy = vi.spyOn(graticuleLayer, 'setProperties');
      testComponent.properties.set(undefined);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith({});
    });

    it('should call setVisible when wolVisible changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setVisible');
      testComponent.visible.set(true);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('should call setZIndex when wolZIndex changes', () => {
      const spy = vi.spyOn(graticuleLayer, 'setZIndex');
      testComponent.zIndex.set(15);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(15);
    });
  });

  // ─── outputs ─────────────────────────────────────────────────────────────

  describe('outputs', () => {
    it('should emit wolChange when OL fires change event', () => {
      const spy = vi.spyOn(graticuleLayerComponent.wolChange, 'emit');
      const event = new BaseEvent('change');
      graticuleLayer.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should emit wolError when OL fires error event', () => {
      const spy = vi.spyOn(graticuleLayerComponent.wolError, 'emit');
      const event = new BaseEvent('error');
      graticuleLayer.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should emit wolPostRender when OL fires postrender event', () => {
      const spy = vi.spyOn(graticuleLayerComponent.wolPostRender, 'emit');
      const event = new RenderEvent('postrender', undefined, undefined, undefined);
      graticuleLayer.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should emit wolPreRender when OL fires prerender event', () => {
      const spy = vi.spyOn(graticuleLayerComponent.wolPreRender, 'emit');
      const event = new RenderEvent('prerender', undefined, undefined, undefined);
      graticuleLayer.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should emit wolPropertyChange when OL fires propertychange event', () => {
      const spy = vi.spyOn(graticuleLayerComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', undefined);
      graticuleLayer.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should emit wolSourceReady when OL fires sourceready event', () => {
      const spy = vi.spyOn(graticuleLayerComponent.wolSourceReady, 'emit');
      const event = new BaseEvent('sourceready');
      graticuleLayer.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });
  });

  // ─── destroy ─────────────────────────────────────────────────────────────

  describe('destroy', () => {
    it('should remove the layer from the map when destroyed', () => {
      const removeLayerSpy = vi.spyOn(mapInstance, 'removeLayer');
      testComponent.destroyLayer.set(true);
      fixture.detectChanges();
      expect(removeLayerSpy).toHaveBeenCalledWith(graticuleLayer);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyLayer.set(true);
      fixture.detectChanges();
      expect(graticuleLayerComponent.getInstance()).toBeUndefined();
    });

    it('should not update wolOpacity signal when OL fires change:opacity after destroy', () => {
      const previousOpacity = testComponent.opacity();
      testComponent.destroyLayer.set(true);
      fixture.detectChanges();
      graticuleLayer.setOpacity(0.99);
      expect(testComponent.opacity()).toBe(previousOpacity);
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyLayer()) {
        <wol-graticule-layer
          [wolClassName]="className()"
          [(wolOpacity)]="opacity"
          [(wolVisible)]="visible"
          [(wolExtent)]="extent"
          [(wolZIndex)]="zIndex"
          [(wolMinResolution)]="minResolution"
          [(wolMaxResolution)]="maxResolution"
          [(wolMinZoom)]="minZoom"
          [(wolMaxZoom)]="maxZoom"
          [wolMaxLines]="maxLines()"
          [wolStrokeStyle]="strokeStyle()"
          [wolTargetSize]="targetSize()"
          [wolShowLabels]="showLabels()"
          [wolLonLabelFormatter]="lonLabelFormatter()"
          [wolLatLabelFormatter]="latLabelFormatter()"
          [wolLonLabelPosition]="lonLabelPosition()"
          [wolLatLabelPosition]="latLabelPosition()"
          [wolLonLabelStyle]="lonLabelStyle()"
          [wolLatLabelStyle]="latLabelStyle()"
          [wolIntervals]="intervals()"
          [wolWrapX]="wrapX()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolGraticuleLayerComponent],
})
class TestGraticuleLayerComponent {
  // models — two-way bindings via signal
  readonly opacity = signal<number>(0.5);
  readonly visible = signal<boolean>(false);
  readonly extent = signal<Extent>([0, 1, 2, 3]);
  readonly zIndex = signal<number>(5);
  readonly minResolution = signal<number>(0.5);
  readonly maxResolution = signal<number>(10);
  readonly minZoom = signal<number>(2);
  readonly maxZoom = signal<number>(9);

  // regular inputs
  readonly className = signal('custom-graticule');
  readonly maxLines = signal<number>(12);
  readonly strokeStyle = signal(new Stroke({ color: 'red' }));
  readonly targetSize = signal<number>(240);
  readonly showLabels = signal<boolean>(false);
  readonly lonLabelFormatter = signal<(lon: number) => string>(lonFormatter);
  readonly latLabelFormatter = signal<(lat: number) => string>(latFormatter);
  readonly lonLabelPosition = signal<number>(0.2);
  readonly latLabelPosition = signal<number>(0.8);
  readonly lonLabelStyle = signal(new Text({ text: 'lon' }));
  readonly latLabelStyle = signal(new Text({ text: 'lat' }));
  readonly intervals = signal<number[]>([30, 10]);
  readonly wrapX = signal<boolean>(false);
  readonly properties = signal<WolProperties | undefined>({ foo: 'bar' });

  // control
  readonly destroyLayer = signal<boolean>(false);
}

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      <wol-graticule-layer
        [wolShowLabels]="true"
        [wolLonLabelFormatter]="lonLabelFormatter"
        [wolLatLabelFormatter]="latLabelFormatter"
        [wolLonLabelPosition]="0.2"
        [wolLatLabelPosition]="0.8"
        [wolLonLabelStyle]="lonLabelStyle"
        [wolLatLabelStyle]="latLabelStyle"
      />
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolGraticuleLayerComponent],
})
class TestGraticuleLayerWithShowLabelsComponent {
  readonly lonLabelFormatter = lonFormatter;
  readonly latLabelFormatter = latFormatter;
  readonly lonLabelStyle = new Text({ text: 'lon' });
  readonly latLabelStyle = new Text({ text: 'lat' });
}
