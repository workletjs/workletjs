import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolFeatureComponent } from '@workletjs/ngx-openlayers/feature';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceComponent } from '@workletjs/ngx-openlayers/source/vector';
import { Coordinate } from 'ol/coordinate';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import Polygon from 'ol/geom/Polygon';
import LinearRing from 'ol/geom/LinearRing';
import { GeometryLayout } from 'ol/geom/Geometry';

import { WolPolygonGeometryComponent } from './polygon-geometry.component';

describe('WolPolygonGeometryComponent', () => {
  let fixture: ComponentFixture<BasicPolygonGeometryComponent>;
  let testComponent: BasicPolygonGeometryComponent;
  let featureComponent: WolFeatureComponent;
  let polygonGeometryComponent: WolPolygonGeometryComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicPolygonGeometryComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
    polygonGeometryComponent = fixture.debugElement.query(
      By.directive(WolPolygonGeometryComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the polygon geometry component', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(polygonGeometryComponent).toBeTruthy();
      expect(polygonGeometryComponent.getInstance()).toBeInstanceOf(Polygon);
    }));

    it('should attach polygon geometry to feature', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(polygon);
    }));
  });

  describe('wolCoordinates Binding (Required Input)', () => {
    it('should set initial coordinates from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ]);
    }));

    it('should update coordinates when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[][] = [
        [
          [5, 5],
          [15, 5],
          [15, 15],
          [5, 15],
          [5, 5],
        ],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should handle simple rectangle', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [100, 0],
          [100, 50],
          [0, 50],
          [0, 0],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(coordinates);
      expect(polygon?.getLinearRingCount()).toBe(1);
    }));

    it('should handle triangle', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [10, 0],
          [5, 10],
          [0, 0],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle polygon with hole', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [20, 0],
          [20, 20],
          [0, 20],
          [0, 0],
        ],
        [
          [5, 5],
          [15, 5],
          [15, 15],
          [5, 15],
          [5, 5],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(coordinates);
      expect(polygon?.getLinearRingCount()).toBe(2);
    }));

    it('should handle polygon with multiple holes', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [30, 0],
          [30, 30],
          [0, 30],
          [0, 0],
        ],
        [
          [5, 5],
          [10, 5],
          [10, 10],
          [5, 10],
          [5, 5],
        ],
        [
          [15, 15],
          [25, 15],
          [25, 25],
          [15, 25],
          [15, 15],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(coordinates);
      expect(polygon?.getLinearRingCount()).toBe(3);
    }));

    it('should handle complex polygon shape', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [10, 0],
          [10, 5],
          [15, 5],
          [15, 10],
          [5, 10],
          [5, 5],
          [0, 5],
          [0, 0],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle negative coordinates', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [-50, -50],
          [-10, -50],
          [-10, -10],
          [-50, -10],
          [-50, -50],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle decimal coordinates', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [12.345, 67.89],
          [23.456, 67.89],
          [23.456, 78.901],
          [12.345, 78.901],
          [12.345, 67.89],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle flat coordinates with layout', fakeAsync(() => {
      const flatCoordinates = [0, 0, 10, 0, 10, 10, 0, 10, 0, 0];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XY');
      testComponent.ends.set([10]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYZ flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 5, 10, 0, 5, 10, 10, 10, 0, 10, 10, 0, 0, 5];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYZ');
      testComponent.ends.set([10]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYM flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 1, 10, 0, 1, 10, 10, 2, 0, 10, 2, 0, 0, 1];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYM');
      testComponent.ends.set([10]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYZM flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 5, 1, 10, 0, 5, 1, 10, 10, 10, 2, 0, 10, 10, 2, 0, 0, 5, 1];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYZM');
      testComponent.ends.set([10]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));
  });

  describe('wolLayout Binding', () => {
    it('should create polygon with undefined layout', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon).toBeInstanceOf(Polygon);
    }));

    it('should create polygon with XY layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon).toBeInstanceOf(Polygon);
      expect(polygon?.getLayout()).toBe('XY');
    }));

    it('should create polygon with XYZ layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0, 5],
          [10, 0, 5],
          [10, 10, 10],
          [0, 10, 10],
          [0, 0, 5],
        ],
      ]);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon).toBeInstanceOf(Polygon);
      expect(polygon?.getLayout()).toBe('XYZ');
    }));

    it('should create polygon with XYM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0, 1],
          [10, 0, 1],
          [10, 10, 2],
          [0, 10, 2],
          [0, 0, 1],
        ],
      ]);
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon).toBeInstanceOf(Polygon);
      expect(polygon?.getLayout()).toBe('XYM');
    }));

    it('should create polygon with XYZM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0, 5, 1],
          [10, 0, 5, 1],
          [10, 10, 10, 2],
          [0, 10, 10, 2],
          [0, 0, 5, 1],
        ],
      ]);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon).toBeInstanceOf(Polygon);
      expect(polygon?.getLayout()).toBe('XYZM');
    }));
  });

  describe('wolEnds Binding', () => {
    it('should create polygon with flat coordinates and ends', fakeAsync(() => {
      testComponent.coordinates.set([0, 0, 10, 0, 10, 10, 0, 10, 0, 0]);
      testComponent.layout.set('XY');
      testComponent.ends.set([10]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon).toBeInstanceOf(Polygon);
      expect(polygon?.getLinearRingCount()).toBe(1);
    }));

    it('should handle polygon with hole using flat coordinates and ends', fakeAsync(() => {
      testComponent.coordinates.set([
        0, 0, 20, 0, 20, 20, 0, 20, 0, 0,  // Outer ring
        5, 5, 15, 5, 15, 15, 5, 15, 5, 5   // Inner ring (hole)
      ]);
      testComponent.layout.set('XY');
      testComponent.ends.set([10, 20]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getLinearRingCount()).toBe(2);
    }));

    it('should handle multiple holes with ends', fakeAsync(() => {
      testComponent.coordinates.set([
        0, 0, 30, 0, 30, 30, 0, 30, 0, 0,      // Outer ring
        5, 5, 10, 5, 10, 10, 5, 10, 5, 5,      // Hole 1
        15, 15, 25, 15, 25, 25, 15, 25, 15, 15 // Hole 2
      ]);
      testComponent.layout.set('XY');
      testComponent.ends.set([10, 20, 30]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getLinearRingCount()).toBe(3);
    }));

    it('should handle undefined ends with nested coordinates', fakeAsync(() => {
      testComponent.ends.set(undefined);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon).toBeInstanceOf(Polygon);
    }));
  });

  describe('Coordinates Update with Layout and Ends', () => {
    it('should use setFlatCoordinates when layout and ends are provided', fakeAsync(() => {
      testComponent.layout.set('XY');
      testComponent.ends.set([10]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance() as Polygon;
      const setFlatCoordinatesSpy = vi.spyOn(polygon, 'setFlatCoordinates');

      const flatCoordinates = [5, 5, 15, 5, 15, 15, 5, 15, 5, 5];
      testComponent.coordinates.set(flatCoordinates);
      fixture.detectChanges();

      expect(setFlatCoordinatesSpy).toHaveBeenCalledWith('XY', flatCoordinates);
    }));

    it('should use setCoordinates for nested array without ends', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance() as Polygon;
      const setCoordinatesSpy = vi.spyOn(polygon, 'setCoordinates');

      const coordinates: Coordinate[][] = [
        [
          [30, 30],
          [40, 30],
          [40, 40],
          [30, 40],
          [30, 30],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      expect(setCoordinatesSpy).toHaveBeenCalledWith(coordinates, undefined);
    }));

    it('should use setCoordinates with layout for nested array', fakeAsync(() => {
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance() as Polygon;
      const setCoordinatesSpy = vi.spyOn(polygon, 'setCoordinates');

      const coordinates: Coordinate[][] = [
        [
          [10, 10, 5],
          [20, 10, 5],
          [20, 20, 10],
          [10, 20, 10],
          [10, 10, 5],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      expect(setCoordinatesSpy).toHaveBeenCalledWith(coordinates, 'XYZ');
    }));
  });

  describe('wolProperties Binding', () => {
    it('should not set properties initially when undefined', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.get('customProp')).toBeUndefined();
    }));

    it('should set properties when input has initial value', fakeAsync(() => {
      const properties: WolProperties = { name: 'test-polygon', id: 555 };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.get('name')).toBe('test-polygon');
      expect(polygon?.get('id')).toBe(555);
    }));

    it('should update properties when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const properties: WolProperties = { type: 'boundary', color: 'red' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.get('type')).toBe('boundary');
      expect(polygon?.get('color')).toBe('red');
    }));

    it('should handle undefined properties update', fakeAsync(() => {
      const properties: WolProperties = { name: 'test' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      const polygon = polygonGeometryComponent.getInstance();
      // Properties should remain when set to undefined
      expect(polygon?.get('name')).toBe('test');
    }));

    it('should handle complex property values', fakeAsync(() => {
      const properties: WolProperties = {
        metadata: { zone: 'A' },
        vertices: [1, 2, 3],
        filled: true,
        area: 100,
      };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.get('metadata')).toEqual({ zone: 'A' });
      expect(polygon?.get('vertices')).toEqual([1, 2, 3]);
      expect(polygon?.get('filled')).toBe(true);
      expect(polygon?.get('area')).toBe(100);
    }));
  });

  describe('Output Events', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(polygonGeometryComponent.wolChange, 'emit');
      const polygon = polygonGeometryComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      polygon?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(polygonGeometryComponent.wolError, 'emit');
      const polygon = polygonGeometryComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      polygon?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));

    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(polygonGeometryComponent.wolPropertyChange, 'emit');
      const polygon = polygonGeometryComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      polygon?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit change event when coordinates are modified', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(polygonGeometryComponent.wolChange, 'emit');
      const polygon = polygonGeometryComponent.getInstance();

      polygon?.setCoordinates([
        [
          [50, 50],
          [100, 50],
          [100, 100],
          [50, 100],
          [50, 50],
        ],
      ]);

      expect(emitSpy).toHaveBeenCalled();
    }));

    it('should call output handlers when events occur', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const onChangeSpy = vi.spyOn(testComponent, 'onChange');
      const onErrorSpy = vi.spyOn(testComponent, 'onError');
      const onPropertyChangeSpy = vi.spyOn(testComponent, 'onPropertyChange');

      const polygon = polygonGeometryComponent.getInstance();

      polygon?.dispatchEvent(new BaseEvent('change'));
      expect(onChangeSpy).toHaveBeenCalled();

      polygon?.dispatchEvent(new BaseEvent('error'));
      expect(onErrorSpy).toHaveBeenCalled();

      polygon?.dispatchEvent(new ObjectEvent('propertychange', 'key', 'value'));
      expect(onPropertyChangeSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance Method', () => {
    it('should return Polygon instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance = polygonGeometryComponent.getInstance();
      expect(instance).toBeInstanceOf(Polygon);
    }));

    it('should return the same instance on multiple calls', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance1 = polygonGeometryComponent.getInstance();
      const instance2 = polygonGeometryComponent.getInstance();

      expect(instance1).toBe(instance2);
    }));
  });

  describe('Destroy Lifecycle', () => {
    it('should clear geometry from feature on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(polygon);

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(featureComponent.getInstance()?.getGeometry()).toBeUndefined();
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(polygonGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(polygonGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should clean up event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(polygonGeometryComponent.wolChange, 'emit');

      fixture.destroy();

      // Try to trigger event after destroy
      const polygon = new Polygon([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ]);
      polygon.dispatchEvent(new BaseEvent('change'));

      expect(emitSpy).not.toHaveBeenCalled();
    }));
  });

  describe('Edge Cases', () => {
    it('should handle rapid coordinate changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      for (let i = 0; i < 10; i++) {
        testComponent.coordinates.set([
          [
            [i, i],
            [i + 10, i],
            [i + 10, i + 10],
            [i, i + 10],
            [i, i],
          ],
        ]);
        fixture.detectChanges();
      }

      const polygon = polygonGeometryComponent.getInstance();
      const coords = polygon?.getCoordinates();
      expect(coords?.[0][0]).toEqual([9, 9]);
    }));

    it('should maintain properties after coordinate updates', fakeAsync(() => {
      const properties: WolProperties = { id: 'polygon-1', persistent: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [
          [50, 50],
          [100, 50],
          [100, 100],
          [50, 100],
          [50, 50],
        ],
      ]);
      fixture.detectChanges();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.get('id')).toBe('polygon-1');
      expect(polygon?.get('persistent')).toBe(true);
    }));

    it('should handle very large polygon', fakeAsync(() => {
      const coordinates: Coordinate[][] = [[]];
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * 2 * Math.PI;
        coordinates[0].push([Math.cos(angle) * 100, Math.sin(angle) * 100]);
      }
      coordinates[0].push(coordinates[0][0]); // Close the ring

      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()[0].length).toBe(101);
    }));

    it('should handle minimum valid polygon (3 unique vertices)', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0],
          [10, 0],
          [5, 10],
          [0, 0],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getCoordinates()[0].length).toBe(4);
    }));
  });

  describe('Integration with Feature', () => {
    it('should update feature geometry when polygon changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[][] = [
        [
          [25, 25],
          [75, 25],
          [75, 75],
          [25, 75],
          [25, 25],
        ],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry() as Polygon;

      expect(geometry?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should reflect polygon geometry in feature properties', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(polygon);
      expect(feature?.getGeometry()?.getType()).toBe('Polygon');
    }));
  });

  describe('Geometry Calculations', () => {
    it('should calculate extent correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0],
          [100, 0],
          [100, 75],
          [0, 75],
          [0, 0],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const extent = polygon?.getExtent();

      expect(extent).toEqual([0, 0, 100, 75]);
    }));

    it('should update extent when coordinates change', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [
          [0, 0],
          [50, 0],
          [50, 50],
          [0, 50],
          [0, 0],
        ],
      ]);
      fixture.detectChanges();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getExtent()).toEqual([0, 0, 50, 50]);

      testComponent.coordinates.set([
        [
          [0, 0],
          [100, 0],
          [100, 100],
          [0, 100],
          [0, 0],
        ],
      ]);
      fixture.detectChanges();

      expect(polygon?.getExtent()).toEqual([0, 0, 100, 100]);
    }));

    it('should calculate area correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const area = polygon?.getArea();

      expect(area).toBe(100);
    }));

    it('should calculate area with hole correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
        [
          [2, 2],
          [8, 2],
          [8, 8],
          [2, 8],
          [2, 2],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const area = polygon?.getArea();

      // Outer area (100) - inner area (36) = 64
      expect(area).toBe(64);
    }));
  });

  describe('Linear Ring Access', () => {
    it('should get linear ring count', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      expect(polygon?.getLinearRingCount()).toBe(1);
    }));

    it('should get linear rings', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const rings = polygon?.getLinearRings();

      expect(rings?.length).toBe(1);
      expect(rings?.[0]).toBeInstanceOf(LinearRing);
    }));

    it('should get linear ring at specific index', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0],
          [20, 0],
          [20, 20],
          [0, 20],
          [0, 0],
        ],
        [
          [5, 5],
          [15, 5],
          [15, 15],
          [5, 15],
          [5, 5],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const outerRing = polygon?.getLinearRing(0);
      const innerRing = polygon?.getLinearRing(1);

      expect(outerRing).toBeInstanceOf(LinearRing);
      expect(innerRing).toBeInstanceOf(LinearRing);
      expect(outerRing?.getCoordinates().length).toBe(5);
      expect(innerRing?.getCoordinates().length).toBe(5);
    }));
  });

  describe('Coordinate Manipulation', () => {
    it('should support appending linear ring', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const holeRing = new LinearRing([
        [3, 3],
        [7, 3],
        [7, 7],
        [3, 7],
        [3, 3],
      ]);

      polygon?.appendLinearRing(holeRing);

      expect(polygon?.getLinearRingCount()).toBe(2);
    }));
  });

  describe('Interior Point', () => {
    it('should calculate interior point', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const polygon = polygonGeometryComponent.getInstance();
      const interiorPoint = polygon?.getInteriorPoint();

      expect(interiorPoint).toBeDefined();
      expect(interiorPoint?.getCoordinates()).toBeDefined();
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
              <wol-polygon-geometry
                [wolCoordinates]="coordinates()"
                [wolLayout]="layout()"
                [wolEnds]="ends()"
                [wolProperties]="properties()"
                (wolChange)="onChange($event)"
                (wolError)="onError($event)"
                (wolPropertyChange)="onPropertyChange($event)"
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
    WolPolygonGeometryComponent,
  ],
})
export class BasicPolygonGeometryComponent {
  coordinates = signal<Coordinate[][] | number[]>([
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
  ]);
  layout = signal<GeometryLayout | undefined>(undefined);
  ends = signal<number[] | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  enabled = signal(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange(event: BaseEvent): void {
    // Event handler for testing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onError(event: BaseEvent): void {
    // Event handler for testing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChange(event: ObjectEvent): void {
    // Event handler for testing
  }
}
