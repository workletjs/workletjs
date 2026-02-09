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
import MultiPolygon from 'ol/geom/MultiPolygon';
import Polygon from 'ol/geom/Polygon';
import { GeometryLayout } from 'ol/geom/Geometry';

import { WolMultiPolygonGeometryComponent } from './multi-polygon-geometry.component';

describe('WolMultiPolygonGeometryComponent', () => {
  let fixture: ComponentFixture<BasicMultiPolygonGeometryComponent>;
  let testComponent: BasicMultiPolygonGeometryComponent;
  let featureComponent: WolFeatureComponent;
  let multiPolygonGeometryComponent: WolMultiPolygonGeometryComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicMultiPolygonGeometryComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
    multiPolygonGeometryComponent = fixture.debugElement.query(
      By.directive(WolMultiPolygonGeometryComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the multi-polygon geometry component', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(multiPolygonGeometryComponent).toBeTruthy();
      expect(multiPolygonGeometryComponent.getInstance()).toBeInstanceOf(MultiPolygon);
    }));

    it('should attach multi-polygon geometry to feature', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(multiPolygon);
    }));
  });

  describe('wolCoordinates Binding (Required Input)', () => {
    it('should set initial coordinates from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual([
        [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
        [
          [
            [20, 20],
            [30, 20],
            [30, 30],
            [20, 30],
            [20, 20],
          ],
        ],
      ]);
    }));

    it('should update coordinates when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[][][] = [
        [
          [
            [5, 5],
            [15, 5],
            [15, 15],
            [5, 15],
            [5, 5],
          ],
        ],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should handle single polygon in multi-polygon', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [
        [
          [
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
            [0, 0],
          ],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual(coordinates);
      expect(multiPolygon?.getPolygons().length).toBe(1);
    }));

    it('should handle multiple polygons', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [
        [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
        [
          [
            [20, 20],
            [30, 20],
            [30, 30],
            [20, 30],
            [20, 20],
          ],
        ],
        [
          [
            [40, 40],
            [50, 40],
            [50, 50],
            [40, 50],
            [40, 40],
          ],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual(coordinates);
      expect(multiPolygon?.getPolygons().length).toBe(3);
    }));

    it('should handle polygon with hole', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [
        [
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
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual(coordinates);
      expect(multiPolygon?.getPolygon(0).getLinearRingCount()).toBe(2);
    }));

    it('should handle multiple polygons with holes', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [
        [
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
        ],
        [
          [
            [30, 30],
            [50, 30],
            [50, 50],
            [30, 50],
            [30, 30],
          ],
          [
            [35, 35],
            [45, 35],
            [45, 45],
            [35, 45],
            [35, 35],
          ],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual(coordinates);
      expect(multiPolygon?.getPolygons().length).toBe(2);
    }));

    it('should handle empty coordinates array', fakeAsync(() => {
      testComponent.coordinates.set([]);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual([]);
      expect(multiPolygon?.getPolygons().length).toBe(0);
    }));

    it('should handle negative coordinates', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [
        [
          [
            [-50, -50],
            [-10, -50],
            [-10, -10],
            [-50, -10],
            [-50, -50],
          ],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle decimal coordinates', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [
        [
          [
            [12.345, 67.89],
            [23.456, 67.89],
            [23.456, 78.901],
            [12.345, 78.901],
            [12.345, 67.89],
          ],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle Polygon array as coordinates', fakeAsync(() => {
      const polygons: Polygon[] = [
        new Polygon([
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ]),
        new Polygon([
          [
            [20, 20],
            [30, 20],
            [30, 30],
            [20, 30],
            [20, 20],
          ],
        ]),
      ];
      testComponent.coordinates.set(polygons);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getPolygons().length).toBe(2);
    }));
  });

  describe('wolLayout Binding', () => {
    it('should create multi-polygon with undefined layout', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon).toBeInstanceOf(MultiPolygon);
    }));

    it('should create multi-polygon with XY layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon).toBeInstanceOf(MultiPolygon);
      expect(multiPolygon?.getLayout()).toBe('XY');
    }));

    it('should create multi-polygon with XYZ layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [
            [0, 0, 5],
            [10, 0, 5],
            [10, 10, 10],
            [0, 10, 10],
            [0, 0, 5],
          ],
        ],
      ]);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon).toBeInstanceOf(MultiPolygon);
      expect(multiPolygon?.getLayout()).toBe('XYZ');
    }));

    it('should create multi-polygon with XYM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [
            [0, 0, 1],
            [10, 0, 1],
            [10, 10, 2],
            [0, 10, 2],
            [0, 0, 1],
          ],
        ],
      ]);
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon).toBeInstanceOf(MultiPolygon);
      expect(multiPolygon?.getLayout()).toBe('XYM');
    }));

    it('should create multi-polygon with XYZM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [
            [0, 0, 5, 1],
            [10, 0, 5, 1],
            [10, 10, 10, 2],
            [0, 10, 10, 2],
            [0, 0, 5, 1],
          ],
        ],
      ]);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon).toBeInstanceOf(MultiPolygon);
      expect(multiPolygon?.getLayout()).toBe('XYZM');
    }));
  });

  describe('wolEndss Binding', () => {
    it('should create multi-polygon with flat coordinates and endss', fakeAsync(() => {
      testComponent.coordinates.set([
        0, 0, 10, 0, 10, 10, 0, 10, 0, 0, 20, 20, 30, 20, 30, 30, 20, 30, 20, 20,
      ]);
      testComponent.layout.set('XY');
      testComponent.endss.set([[10], [20]]);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon).toBeInstanceOf(MultiPolygon);
      expect(multiPolygon?.getPolygons().length).toBe(2);
    }));

    it('should handle multiple rings with endss', fakeAsync(() => {
      // Polygon with hole using flat coordinates
      testComponent.coordinates.set([
        0,
        0,
        20,
        0,
        20,
        20,
        0,
        20,
        0,
        0, // Outer ring
        5,
        5,
        15,
        5,
        15,
        15,
        5,
        15,
        5,
        5, // Inner ring (hole)
      ]);
      testComponent.layout.set('XY');
      testComponent.endss.set([[10, 20]]); // First polygon has 2 rings
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getPolygons().length).toBe(1);
      expect(multiPolygon?.getPolygon(0).getLinearRingCount()).toBe(2);
    }));

    it('should handle undefined endss with nested coordinates', fakeAsync(() => {
      testComponent.endss.set(undefined);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon).toBeInstanceOf(MultiPolygon);
    }));
  });

  describe('wolProperties Binding', () => {
    it('should not set properties initially when undefined', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.get('customProp')).toBeUndefined();
    }));

    it('should set properties when input has initial value', fakeAsync(() => {
      const properties: WolProperties = { name: 'test-multi-polygon', id: 999 };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.get('name')).toBe('test-multi-polygon');
      expect(multiPolygon?.get('id')).toBe(999);
    }));

    it('should update properties when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const properties: WolProperties = { type: 'zones', category: 'restricted' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.get('type')).toBe('zones');
      expect(multiPolygon?.get('category')).toBe('restricted');
    }));

    it('should handle undefined properties update', fakeAsync(() => {
      const properties: WolProperties = { name: 'test' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      // Properties should remain when set to undefined
      expect(multiPolygon?.get('name')).toBe('test');
    }));

    it('should handle complex property values', fakeAsync(() => {
      const properties: WolProperties = {
        metadata: { region: 'north' },
        areas: [100, 200, 300],
        protected: true,
        count: 2,
      };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.get('metadata')).toEqual({ region: 'north' });
      expect(multiPolygon?.get('areas')).toEqual([100, 200, 300]);
      expect(multiPolygon?.get('protected')).toBe(true);
      expect(multiPolygon?.get('count')).toBe(2);
    }));
  });

  describe('Output Events', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPolygonGeometryComponent.wolChange, 'emit');
      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      multiPolygon?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPolygonGeometryComponent.wolError, 'emit');
      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      multiPolygon?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));

    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPolygonGeometryComponent.wolPropertyChange, 'emit');
      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      multiPolygon?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit change event when coordinates are modified', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPolygonGeometryComponent.wolChange, 'emit');
      const multiPolygon = multiPolygonGeometryComponent.getInstance();

      multiPolygon?.setCoordinates([
        [
          [
            [50, 50],
            [100, 50],
            [100, 100],
            [50, 100],
            [50, 50],
          ],
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

      const multiPolygon = multiPolygonGeometryComponent.getInstance();

      multiPolygon?.dispatchEvent(new BaseEvent('change'));
      expect(onChangeSpy).toHaveBeenCalled();

      multiPolygon?.dispatchEvent(new BaseEvent('error'));
      expect(onErrorSpy).toHaveBeenCalled();

      multiPolygon?.dispatchEvent(new ObjectEvent('propertychange', 'key', 'value'));
      expect(onPropertyChangeSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance Method', () => {
    it('should return MultiPolygon instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance = multiPolygonGeometryComponent.getInstance();
      expect(instance).toBeInstanceOf(MultiPolygon);
    }));

    it('should return the same instance on multiple calls', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance1 = multiPolygonGeometryComponent.getInstance();
      const instance2 = multiPolygonGeometryComponent.getInstance();

      expect(instance1).toBe(instance2);
    }));
  });

  describe('Destroy Lifecycle', () => {
    it('should clear geometry from feature on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(multiPolygon);

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(featureComponent.getInstance()?.getGeometry()).toBeUndefined();
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(multiPolygonGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(multiPolygonGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should clean up event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPolygonGeometryComponent.wolChange, 'emit');

      fixture.destroy();

      // Try to trigger event after destroy
      const multiPolygon = new MultiPolygon([
        [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
      ]);
      multiPolygon.dispatchEvent(new BaseEvent('change'));

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
            [
              [i, i],
              [i + 10, i],
              [i + 10, i + 10],
              [i, i + 10],
              [i, i],
            ],
          ],
        ]);
        fixture.detectChanges();
      }

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const coords = multiPolygon?.getCoordinates();
      expect(coords?.[0][0][0]).toEqual([9, 9]);
    }));

    it('should maintain properties after coordinate updates', fakeAsync(() => {
      const properties: WolProperties = { id: 'multi-polygon-1', persistent: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [
          [
            [50, 50],
            [100, 50],
            [100, 100],
            [50, 100],
            [50, 50],
          ],
        ],
      ]);
      fixture.detectChanges();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.get('id')).toBe('multi-polygon-1');
      expect(multiPolygon?.get('persistent')).toBe(true);
    }));

    it('should handle complex multi-ring polygons', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [
        [
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
        ],
      ];

      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getPolygons().length).toBe(1);
      expect(multiPolygon?.getPolygon(0).getLinearRingCount()).toBe(3);
    }));

    it('should handle many polygons', fakeAsync(() => {
      const coordinates: Coordinate[][][] = [];
      for (let i = 0; i < 50; i++) {
        coordinates.push([
          [
            [i * 20, i * 20],
            [i * 20 + 10, i * 20],
            [i * 20 + 10, i * 20 + 10],
            [i * 20, i * 20 + 10],
            [i * 20, i * 20],
          ],
        ]);
      }

      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getPolygons().length).toBe(50);
    }));
  });

  describe('Integration with Feature', () => {
    it('should update feature geometry when multi-polygon changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[][][] = [
        [
          [
            [25, 25],
            [75, 25],
            [75, 75],
            [25, 75],
            [25, 25],
          ],
        ],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry() as MultiPolygon;

      expect(geometry?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should reflect multi-polygon geometry in feature properties', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(multiPolygon);
      expect(feature?.getGeometry()?.getType()).toBe('MultiPolygon');
    }));
  });

  describe('Geometry Calculations', () => {
    it('should calculate extent correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [
            [0, 0],
            [50, 0],
            [50, 50],
            [0, 50],
            [0, 0],
          ],
        ],
        [
          [
            [25, 25],
            [100, 25],
            [100, 75],
            [25, 75],
            [25, 25],
          ],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const extent = multiPolygon?.getExtent();

      expect(extent).toEqual([0, 0, 100, 75]);
    }));

    it('should update extent when coordinates change', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [
          [
            [0, 0],
            [50, 0],
            [50, 50],
            [0, 50],
            [0, 0],
          ],
        ],
      ]);
      fixture.detectChanges();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getExtent()).toEqual([0, 0, 50, 50]);

      testComponent.coordinates.set([
        [
          [
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100],
            [0, 0],
          ],
        ],
      ]);
      fixture.detectChanges();

      expect(multiPolygon?.getExtent()).toEqual([0, 0, 100, 100]);
    }));

    it('should calculate area correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
          ],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const area = multiPolygon?.getArea();

      expect(area).toBe(100);
    }));
  });

  describe('Polygon Access', () => {
    it('should get individual polygons', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const polygons = multiPolygon?.getPolygons();

      expect(polygons?.length).toBe(2);
      expect(polygons?.[0]).toBeInstanceOf(Polygon);
      expect(polygons?.[1]).toBeInstanceOf(Polygon);
    }));

    it('should get polygon at specific index', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const firstPolygon = multiPolygon?.getPolygon(0);
      const secondPolygon = multiPolygon?.getPolygon(1);

      expect(firstPolygon?.getCoordinates()).toEqual([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ]);
      expect(secondPolygon?.getCoordinates()).toEqual([
        [
          [20, 20],
          [30, 20],
          [30, 30],
          [20, 30],
          [20, 20],
        ],
      ]);
    }));

    it('should get all coordinates', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      const coordinates = multiPolygon?.getCoordinates();

      expect(coordinates?.length).toBe(2);
    }));
  });

  describe('Coordinates Update with Polygon Array', () => {
    it('should convert Polygon array to flat coordinates', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygons: Polygon[] = [
        new Polygon([
          [
            [5, 5],
            [15, 5],
            [15, 15],
            [5, 15],
            [5, 5],
          ],
        ]),
      ];

      testComponent.coordinates.set(polygons);
      fixture.detectChanges();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getPolygons().length).toBe(1);
    }));

    it('should handle empty Polygon array', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const polygons: Polygon[] = [];
      testComponent.coordinates.set(polygons);
      fixture.detectChanges();

      const multiPolygon = multiPolygonGeometryComponent.getInstance();
      expect(multiPolygon?.getPolygons().length).toBe(0);
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
              <wol-multi-polygon-geometry
                [wolCoordinates]="coordinates()"
                [wolLayout]="layout()"
                [wolEndss]="endss()"
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
    WolMultiPolygonGeometryComponent,
  ],
})
export class BasicMultiPolygonGeometryComponent {
  coordinates = signal<Coordinate[][][] | Polygon[] | number[]>([
    [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
    ],
    [
      [
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20],
      ],
    ],
  ]);
  layout = signal<GeometryLayout | undefined>(undefined);
  endss = signal<number[][] | undefined>(undefined);
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
