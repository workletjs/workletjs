import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { ObjectEvent } from 'ol/Object';
import { Geometry, Point, LineString, Polygon } from 'ol/geom';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { StyleFunction, StyleLike } from 'ol/style/Style';
import BaseEvent from 'ol/events/Event';
import Feature from 'ol/Feature';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceComponent } from '@workletjs/ngx-openlayers/source/vector';
import { WolFeatureComponent } from './feature.component';

describe('WolFeatureComponent', () => {
  let fixture: ComponentFixture<BasicFeatureComponent>;
  let testComponent: BasicFeatureComponent;
  let featureComponent: WolFeatureComponent;
  let vectorSourceComponent: WolVectorSourceComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicFeatureComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    vectorSourceComponent = fixture.debugElement.query(
      By.directive(WolVectorSourceComponent),
    ).componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the feature component within the vector source', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const feature = featureComponent.getInstance();
      const vectorSource = vectorSourceComponent.getInstance();

      expect(featureComponent).toBeTruthy();
      expect(feature).toBeInstanceOf(Feature);
      expect(vectorSource?.getFeatures()).toContain(feature);
    }));
  });

  describe('Input: wolId', () => {
    it('should set initial id from signal', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getId()).toBe('feature-1');
    }));

    it('should update id when signal changes', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.id.set('feature-2');
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getId()).toBe('feature-2');
    }));

    it('should handle numeric id', fakeAsync(() => {
      testComponent.id.set(123);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getId()).toBe(123);
    }));

    it('should handle undefined id', fakeAsync(() => {
      testComponent.id.set(undefined);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getId()).toBeUndefined();
    }));
  });

  describe('Input: wolGeometry', () => {
    it('should set initial geometry from signal', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry();
      expect(geometry).toBeInstanceOf(Point);
      expect((geometry as Point).getCoordinates()).toEqual([0, 0]);
    }));

    it('should update geometry when signal changes to LineString', fakeAsync(() => {
      fixture.detectChanges();

      const lineGeometry = new LineString([
        [0, 0],
        [10, 10],
      ]);
      testComponent.geometry.set(lineGeometry);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry();
      expect(geometry).toBeInstanceOf(LineString);
      expect(geometry).toBe(lineGeometry);
    }));

    it('should update geometry when signal changes to Polygon', fakeAsync(() => {
      fixture.detectChanges();

      const polygonGeometry = new Polygon([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ]);
      testComponent.geometry.set(polygonGeometry);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry();
      expect(geometry).toBeInstanceOf(Polygon);
      expect(geometry).toBe(polygonGeometry);
    }));

    it('should update signal when geometry changes programmatically', fakeAsync(() => {
      fixture.detectChanges();

      const newGeometry = new Point([100, 100]);
      const geometrySpy = vi.spyOn(featureComponent.wolGeometry, 'set');
      const feature = featureComponent.getInstance();
      feature?.setGeometry(newGeometry);
      fixture.detectChanges();

      expect(testComponent.geometry()).toBe(newGeometry);
      expect(geometrySpy).toHaveBeenCalledWith(newGeometry);
    }));

    it('should handle undefined geometry', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.geometry.set(undefined);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getGeometry()).toBeUndefined();
    }));
  });

  describe('Input: wolGeometryName', () => {
    it('should set initial geometry name from signal', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getGeometryName()).toBe('geometry');
    }));

    it('should update geometry name when signal changes', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.geometryName.set('newGeometryName');
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getGeometryName()).toBe('newGeometryName');
      expect(feature?.getGeometry()).toBeInstanceOf(Polygon);
    }));

    it('should use default geometry name if not specified', fakeAsync(() => {
      testComponent.geometryName.set(undefined);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getGeometryName()).toBe('geometry');
      expect(feature?.getGeometry()).toBeInstanceOf(Point);
    }));
  });

  describe('Input: wolStyle', () => {
    it('should set initial style from signal', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const style = feature?.getStyle();
      expect(style).toBeInstanceOf(Style);
    }));

    it('should update style when signal changes', fakeAsync(() => {
      fixture.detectChanges();

      const newStyle = new Style({
        fill: new Fill({ color: 'blue' }),
        stroke: new Stroke({ color: 'white', width: 2 }),
      });
      testComponent.style.set(newStyle);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getStyle()).toBe(newStyle);
    }));

    it('should handle array of styles', fakeAsync(() => {
      fixture.detectChanges();

      const styles = [
        new Style({ fill: new Fill({ color: 'red' }) }),
        new Style({ stroke: new Stroke({ color: 'blue' }) }),
      ];
      testComponent.style.set(styles);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getStyle()).toEqual(styles);
    }));

    it('should handle style function', fakeAsync(() => {
      fixture.detectChanges();

      const styleFunction: StyleFunction = () => [
        new Style({ fill: new Fill({ color: 'green' }) }),
      ];
      testComponent.style.set(styleFunction);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getStyle()).toBe(styleFunction);
    }));

    it('should unset style when set to undefined', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.style.set(undefined);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getStyle()).toBeUndefined();
    }));
  });

  describe('Input: wolProperties', () => {
    it('should set initial properties from signal', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.get('name')).toBe('test-feature');
      expect(feature?.get('type')).toBe('point');
    }));

    it('should update properties when signal changes', fakeAsync(() => {
      fixture.detectChanges();

      const properties: WolProperties = { name: 'updated-feature', active: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.get('name')).toBe('updated-feature');
      expect(feature?.get('active')).toBe(true);
    }));

    it('should handle empty properties object', fakeAsync(() => {
      testComponent.properties.set({});
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature).toBeDefined();
    }));
  });

  describe('Output: wolChange', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(featureComponent.wolChange, 'emit');
      const feature = featureComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      feature?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit change event when feature is modified', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(featureComponent.wolChange, 'emit');
      const feature = featureComponent.getInstance();

      feature?.changed();

      expect(emitSpy).toHaveBeenCalled();
    }));
  });

  describe('Output: wolError', () => {
    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(featureComponent.wolError, 'emit');
      const feature = featureComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      feature?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));
  });

  describe('Output: wolPropertyChange', () => {
    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(featureComponent.wolPropertyChange, 'emit');
      const feature = featureComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      feature?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit propertychange event when property is set', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(featureComponent.wolPropertyChange, 'emit');
      const feature = featureComponent.getInstance();

      feature?.set('customProp', 'newValue');

      expect(emitSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance', () => {
    it('should return Feature instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      const instance = featureComponent.getInstance();
      expect(instance).toBeInstanceOf(Feature);
    }));
  });

  describe('Lifecycle', () => {
    it('should add feature to vector source on initialization', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const vectorSource = vectorSourceComponent.getInstance();

      expect(vectorSource?.getFeatures()).toContain(feature);
    }));

    it('should remove feature from vector source on destroy', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const vectorSource = vectorSourceComponent.getInstance();

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(vectorSource?.getFeatures()).not.toContain(feature);
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      expect(featureComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(featureComponent.getInstance()).toBeUndefined();
    }));

    it('should unregister event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const emitSpy = vi.spyOn(featureComponent.wolChange, 'emit');

      fixture.destroy();

      const changeEvent = new BaseEvent('change');
      feature?.dispatchEvent(changeEvent);

      expect(emitSpy).not.toHaveBeenCalled();
    }));
  });

  describe('Multiple input changes', () => {
    it('should handle multiple properties changed together', fakeAsync(() => {
      fixture.detectChanges();

      const newGeometry = new Point([50, 50]);
      const newStyle = new Style({ fill: new Fill({ color: 'yellow' }) });
      testComponent.id.set('updated-id');
      testComponent.geometry.set(newGeometry);
      testComponent.style.set(newStyle);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getId()).toBe('updated-id');
      expect(feature?.getGeometry()).toBe(newGeometry);
      expect(feature?.getStyle()).toBe(newStyle);
    }));
  });

  describe('Edge cases', () => {
    it('should handle rapid geometry changes', fakeAsync(() => {
      fixture.detectChanges();

      for (let i = 0; i < 10; i++) {
        testComponent.geometry.set(new Point([i * 10, i * 10]));
        fixture.detectChanges();
      }

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry() as Point;
      expect(geometry?.getCoordinates()).toEqual([90, 90]);
    }));

    it('should handle switching between different geometry types', fakeAsync(() => {
      fixture.detectChanges();

      const geometries: Geometry[] = [
        new Point([0, 0]),
        new LineString([
          [0, 0],
          [10, 10],
        ]),
        new Polygon([
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ]),
        new Point([50, 50]),
      ];

      geometries.forEach((geom) => {
        testComponent.geometry.set(geom);
        fixture.detectChanges();

        const feature = featureComponent.getInstance();
        expect(feature?.getGeometry()).toBe(geom);
      });
    }));

    it('should allow retrieving feature by id from source', fakeAsync(() => {
      fixture.detectChanges();

      const vectorSource = vectorSourceComponent.getInstance();
      const featureById = vectorSource?.getFeatureById('feature-1');

      expect(featureById).toBe(featureComponent.getInstance());
    }));
  });

  describe('Integration with geometry property', () => {
    beforeEach(() => {
      testComponent.geometryName.set('newGeometryName');
    });

    it('should access geometry via custom geometry name', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.get('newGeometryName');

      expect(geometry).toBeInstanceOf(Polygon);
    }));

    it('should update geometry property when geometry changes', fakeAsync(() => {
      fixture.detectChanges();

      const newGeometry = new Point([100, 100]);
      testComponent.geometry.set(newGeometry);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometryProp = feature?.get('newGeometryName');

      expect(geometryProp).toBe(newGeometry);
    }));
  });

  describe('Feature properties and geometry interaction', () => {
    it('should preserve custom properties when geometry changes', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      feature?.set('customProp', 'customValue');

      testComponent.geometry.set(new Point([50, 50]));
      fixture.detectChanges();

      expect(feature?.get('customProp')).toBe('customValue');
    }));

    it('should preserve geometry when properties change', fakeAsync(() => {
      fixture.detectChanges();

      const originalGeometry = featureComponent.getInstance()?.getGeometry();

      testComponent.properties.set({ newProp: 'newValue' });
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getGeometry()).toBe(originalGeometry);
    }));
  });
});

@Component({
  template: `
    <wol-map>
      <wol-vector-layer>
        <wol-vector-source>
          @if (enabled()) {
            <wol-feature
              [wolId]="id()"
              [(wolGeometry)]="geometry"
              [wolGeometryName]="geometryName()"
              [wolStyle]="style()"
              [wolProperties]="properties()"
            />
          }
        </wol-vector-source>
      </wol-vector-layer>
    </wol-map>
  `,
  imports: [
    WolMapComponent,
    WolVectorLayerComponent,
    WolVectorSourceComponent,
    WolFeatureComponent,
  ],
})
export class BasicFeatureComponent {
  id = signal<string | number | undefined>('feature-1');
  geometry = signal<Geometry | undefined>(new Point([0, 0]));
  geometryName = signal<string | undefined>(undefined);
  style = signal<StyleLike | undefined>(
    new Style({
      fill: new Fill({ color: 'red' }),
      stroke: new Stroke({ color: 'black', width: 1 }),
      image: new CircleStyle({ radius: 5, fill: new Fill({ color: 'red' }) }),
    }),
  );
  properties = signal<WolProperties | undefined>({
    name: 'test-feature',
    type: 'point',
    newGeometryName: new Polygon([
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
    ]),
  });
  enabled = signal(true);
}
