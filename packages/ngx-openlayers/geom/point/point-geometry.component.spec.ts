import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { Coordinate } from 'ol/coordinate';
import { ObjectEvent } from 'ol/Object';
import { Point } from 'ol/geom';
import { GeometryLayout } from 'ol/geom/Geometry';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceComponent } from '@workletjs/ngx-openlayers/source/vector';
import { WolFeatureComponent } from '@workletjs/ngx-openlayers/feature';
import { WolPointGeometryComponent } from './point-geometry.component';

describe('WolPointGeometryComponent', () => {
  let fixture: ComponentFixture<BasicPointGeometryComponent>;
  let testComponent: BasicPointGeometryComponent;
  let featureComponent: WolFeatureComponent;
  let pointGeometryComponent: WolPointGeometryComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicPointGeometryComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
    pointGeometryComponent = fixture.debugElement.query(
      By.directive(WolPointGeometryComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the point geometry component within the feature', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const point = pointGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(pointGeometryComponent).toBeTruthy();
      expect(point).toBeInstanceOf(Point);
      expect(feature?.getGeometry()).toBe(point);
    }));
  });

  describe('Input: wolCoordinates (required)', () => {
    it('should set initial coordinates from signal', fakeAsync(() => {
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([0, 0]);
    }));

    it('should update coordinates when signal changes', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.coordinates.set([100, 50]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([100, 50]);
    }));

    it('should handle 3D coordinates (X, Y, Z)', fakeAsync(() => {
      testComponent.coordinates.set([10, 20, 30]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([10, 20, 30]);
    }));

    it('should handle 4D coordinates (X, Y, Z, M)', fakeAsync(() => {
      testComponent.coordinates.set([10, 20, 30, 40]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([10, 20, 30, 40]);
    }));

    it('should update coordinates multiple times', fakeAsync(() => {
      fixture.detectChanges();

      const coordinates: Coordinate[] = [
        [10, 10],
        [20, 20],
        [30, 30],
      ];

      coordinates.forEach((coord) => {
        testComponent.coordinates.set(coord);
        fixture.detectChanges();

        const point = pointGeometryComponent.getInstance();
        expect(point?.getCoordinates()).toEqual(coord);
      });
    }));

    it('should handle negative coordinates', fakeAsync(() => {
      testComponent.coordinates.set([-50, -100]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([-50, -100]);
    }));

    it('should handle coordinates with decimal values', fakeAsync(() => {
      testComponent.coordinates.set([10.5, 20.75]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([10.5, 20.75]);
    }));

    it('should handle very large coordinate values', fakeAsync(() => {
      testComponent.coordinates.set([1000000, 2000000]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([1000000, 2000000]);
    }));
  });

  describe('Input: wolLayout', () => {
    it('should use default layout when not specified', fakeAsync(() => {
      testComponent.layout.set(undefined);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XY');
    }));

    it('should set XY layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XY');
    }));

    it('should set XYZ layout', fakeAsync(() => {
      testComponent.layout.set('XYZ');
      testComponent.coordinates.set([10, 20, 30]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XYZ');
    }));

    it('should set XYM layout', fakeAsync(() => {
      testComponent.layout.set('XYM');
      testComponent.coordinates.set([10, 20, 30]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XYM');
    }));

    it('should set XYZM layout', fakeAsync(() => {
      testComponent.layout.set('XYZM');
      testComponent.coordinates.set([10, 20, 30, 40]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XYZM');
    }));

    it('should update layout when signal changes', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      let point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XY');

      testComponent.layout.set('XYZ');
      testComponent.coordinates.set([10, 20, 30]);
      fixture.detectChanges();

      point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XYZ');
    }));
  });

  describe('Input: wolProperties', () => {
    it('should set initial properties from signal', fakeAsync(() => {
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.get('name')).toBe('test-point');
      expect(point?.get('type')).toBe('location');
    }));

    it('should update properties when signal changes', fakeAsync(() => {
      fixture.detectChanges();

      const properties: WolProperties = { name: 'updated-point', active: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.get('name')).toBe('updated-point');
      expect(point?.get('active')).toBe(true);
    }));

    it('should handle undefined properties', fakeAsync(() => {
      testComponent.properties.set(undefined);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point).toBeDefined();
    }));

    it('should handle empty properties object', fakeAsync(() => {
      testComponent.properties.set({});
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point).toBeDefined();
    }));
  });

  describe('Output: wolChange', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(pointGeometryComponent.wolChange, 'emit');
      const point = pointGeometryComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      point?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit change event when point is modified', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(pointGeometryComponent.wolChange, 'emit');
      const point = pointGeometryComponent.getInstance();

      point?.changed();

      expect(emitSpy).toHaveBeenCalled();
    }));
  });

  describe('Output: wolError', () => {
    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(pointGeometryComponent.wolError, 'emit');
      const point = pointGeometryComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      point?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));
  });

  describe('Output: wolPropertyChange', () => {
    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(pointGeometryComponent.wolPropertyChange, 'emit');
      const point = pointGeometryComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      point?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit propertychange event when property is set', fakeAsync(() => {
      fixture.detectChanges();

      const emitSpy = vi.spyOn(pointGeometryComponent.wolPropertyChange, 'emit');
      const point = pointGeometryComponent.getInstance();

      point?.set('customProp', 'newValue');

      expect(emitSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance', () => {
    it('should return Point instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      const instance = pointGeometryComponent.getInstance();
      expect(instance).toBeInstanceOf(Point);
    }));
  });

  describe('Lifecycle', () => {
    it('should set geometry on feature on initialization', fakeAsync(() => {
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(point);
    }));

    it('should unset geometry on feature on destroy', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      expect(feature?.getGeometry()).toBeDefined();

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(feature?.getGeometry()).toBeUndefined();
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      expect(pointGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(pointGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should unregister event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      const emitSpy = vi.spyOn(pointGeometryComponent.wolChange, 'emit');

      fixture.destroy();

      const changeEvent = new BaseEvent('change');
      point?.dispatchEvent(changeEvent);

      expect(emitSpy).not.toHaveBeenCalled();
    }));
  });

  describe('Multiple input changes', () => {
    it('should handle coordinates and layout changed together', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.coordinates.set([50, 100, 150]);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([50, 100, 150]);
      expect(point?.getLayout()).toBe('XYZ');
    }));

    it('should handle coordinates and properties changed together', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.coordinates.set([25, 75]);
      testComponent.properties.set({ city: 'New York', population: 8000000 });
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([25, 75]);
      expect(point?.get('city')).toBe('New York');
      expect(point?.get('population')).toBe(8000000);
    }));
  });

  describe('Integration with Feature', () => {
    it('should update feature geometry when coordinates change', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const originalGeometry = feature?.getGeometry();

      testComponent.coordinates.set([200, 300]);
      fixture.detectChanges();

      const newGeometry = feature?.getGeometry() as Point;
      expect(newGeometry).toBe(originalGeometry);
      expect(newGeometry?.getCoordinates()).toEqual([200, 300]);
    }));

    it('should maintain feature properties when geometry changes', fakeAsync(() => {
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      feature?.set('featureProp', 'featureValue');

      testComponent.coordinates.set([50, 50]);
      fixture.detectChanges();

      expect(feature?.get('featureProp')).toBe('featureValue');
    }));
  });

  describe('Edge cases', () => {
    it('should handle rapid coordinate changes', fakeAsync(() => {
      fixture.detectChanges();

      for (let i = 0; i < 100; i++) {
        testComponent.coordinates.set([i, i * 2]);
        fixture.detectChanges();
      }

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([99, 198]);
    }));

    it('should handle coordinates at origin', fakeAsync(() => {
      testComponent.coordinates.set([0, 0]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual([0, 0]);
    }));

    it('should handle coordinate precision', fakeAsync(() => {
      const coords: Coordinate = [1.23456789, 9.87654321];
      testComponent.coordinates.set(coords);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getCoordinates()).toEqual(coords);
    }));

    it('should preserve geometry properties during coordinate updates', fakeAsync(() => {
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      point?.set('customGeomProp', 'value');

      testComponent.coordinates.set([50, 50]);
      fixture.detectChanges();

      expect(point?.get('customGeomProp')).toBe('value');
    }));
  });

  describe('Layout and coordinate dimension consistency', () => {
    it('should handle XY layout with 2D coordinates', fakeAsync(() => {
      testComponent.layout.set('XY');
      testComponent.coordinates.set([10, 20]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XY');
      expect(point?.getCoordinates().length).toBe(2);
    }));

    it('should handle XYZ layout with 3D coordinates', fakeAsync(() => {
      testComponent.layout.set('XYZ');
      testComponent.coordinates.set([10, 20, 30]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XYZ');
      expect(point?.getCoordinates().length).toBe(3);
    }));

    it('should handle XYZM layout with 4D coordinates', fakeAsync(() => {
      testComponent.layout.set('XYZM');
      testComponent.coordinates.set([10, 20, 30, 40]);
      fixture.detectChanges();

      const point = pointGeometryComponent.getInstance();
      expect(point?.getLayout()).toBe('XYZM');
      expect(point?.getCoordinates().length).toBe(4);
    }));
  });
});

@Component({
  template: `
    <wol-map>
      <wol-vector-layer>
        <wol-vector-source>
          <wol-feature>
            @if (enabled()) {
              <wol-point-geometry
                [wolCoordinates]="coordinates()"
                [wolLayout]="layout()"
                [wolProperties]="properties()"
              />
            }
          </wol-feature>
        </wol-vector-source>
      </wol-vector-layer>
    </wol-map>
  `,
  imports: [
    WolMapComponent,
    WolVectorLayerComponent,
    WolVectorSourceComponent,
    WolFeatureComponent,
    WolPointGeometryComponent,
  ],
})
export class BasicPointGeometryComponent {
  coordinates = signal<Coordinate>([0, 0]);
  layout = signal<GeometryLayout | undefined>(undefined);
  properties = signal<WolProperties | undefined>({ name: 'test-point', type: 'location' });
  enabled = signal(true);
}
