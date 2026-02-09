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
import MultiPoint from 'ol/geom/MultiPoint';
import Point from 'ol/geom/Point';
import { GeometryLayout } from 'ol/geom/Geometry';

import { WolMultiPointGeometryComponent } from './multi-point-geometry.component';

describe('WolMultiPointGeometryComponent', () => {
  let fixture: ComponentFixture<BasicMultiPointGeometryComponent>;
  let testComponent: BasicMultiPointGeometryComponent;
  let featureComponent: WolFeatureComponent;
  let multiPointGeometryComponent: WolMultiPointGeometryComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicMultiPointGeometryComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
    multiPointGeometryComponent = fixture.debugElement.query(
      By.directive(WolMultiPointGeometryComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the multi-point geometry component', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(multiPointGeometryComponent).toBeTruthy();
      expect(multiPointGeometryComponent.getInstance()).toBeInstanceOf(MultiPoint);
    }));

    it('should attach multi-point geometry to feature', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(multiPoint);
    }));
  });

  describe('wolCoordinates Binding (Required Input)', () => {
    it('should set initial coordinates from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual([
        [0, 0],
        [10, 10],
        [20, 20],
      ]);
    }));

    it('should update coordinates when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[] = [
        [5, 5],
        [15, 15],
        [25, 25],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should handle single point', fakeAsync(() => {
      const coordinates: Coordinate[] = [[100, 100]];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual(coordinates);
      expect(multiPoint?.getPoints().length).toBe(1);
    }));

    it('should handle many points', fakeAsync(() => {
      const coordinates: Coordinate[] = [];
      for (let i = 0; i < 100; i++) {
        coordinates.push([i, i]);
      }
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual(coordinates);
      expect(multiPoint?.getPoints().length).toBe(100);
    }));

    it('should handle negative coordinates', fakeAsync(() => {
      const coordinates: Coordinate[] = [
        [-50, -50],
        [-10, -10],
        [10, 10],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle decimal coordinates', fakeAsync(() => {
      const coordinates: Coordinate[] = [
        [12.345, 67.89],
        [23.456, 78.901],
        [34.567, 89.012],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle large coordinate values', fakeAsync(() => {
      const coordinates: Coordinate[] = [
        [1000000, 2000000],
        [3000000, 4000000],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle empty coordinates array', fakeAsync(() => {
      testComponent.coordinates.set([]);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual([]);
      expect(multiPoint?.getPoints().length).toBe(0);
    }));

    it('should handle flat coordinates with layout', fakeAsync(() => {
      const flatCoordinates = [0, 0, 10, 10, 20, 20];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYZ flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 5, 10, 10, 10, 20, 20, 15];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYM flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 1, 10, 10, 2, 20, 20, 3];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYZM flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 5, 1, 10, 10, 10, 2, 20, 20, 15, 3];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));
  });

  describe('wolLayout Binding', () => {
    it('should create multi-point with undefined layout', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint).toBeInstanceOf(MultiPoint);
    }));

    it('should create multi-point with XY layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint).toBeInstanceOf(MultiPoint);
      expect(multiPoint?.getLayout()).toBe('XY');
    }));

    it('should create multi-point with XYZ layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 5],
        [10, 10, 10],
        [20, 20, 15],
      ]);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint).toBeInstanceOf(MultiPoint);
      expect(multiPoint?.getLayout()).toBe('XYZ');
    }));

    it('should create multi-point with XYM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 1],
        [10, 10, 2],
        [20, 20, 3],
      ]);
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint).toBeInstanceOf(MultiPoint);
      expect(multiPoint?.getLayout()).toBe('XYM');
    }));

    it('should create multi-point with XYZM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 5, 1],
        [10, 10, 10, 2],
        [20, 20, 15, 3],
      ]);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint).toBeInstanceOf(MultiPoint);
      expect(multiPoint?.getLayout()).toBe('XYZM');
    }));
  });

  describe('Coordinates Update with Layout', () => {
    it('should use setFlatCoordinates for flat array with layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance() as MultiPoint;
      const setFlatCoordinatesSpy = vi.spyOn(multiPoint, 'setFlatCoordinates');

      const flatCoordinates = [5, 5, 15, 15, 25, 25];
      testComponent.coordinates.set(flatCoordinates);
      fixture.detectChanges();

      expect(setFlatCoordinatesSpy).toHaveBeenCalledWith('XY', flatCoordinates);
    }));

    it('should use setCoordinates for nested array', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance() as MultiPoint;
      const setCoordinatesSpy = vi.spyOn(multiPoint, 'setCoordinates');

      const coordinates: Coordinate[] = [
        [30, 30],
        [40, 40],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      expect(setCoordinatesSpy).toHaveBeenCalledWith(coordinates, undefined);
    }));

    it('should use setCoordinates with layout for nested array', fakeAsync(() => {
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance() as MultiPoint;
      const setCoordinatesSpy = vi.spyOn(multiPoint, 'setCoordinates');

      const coordinates: Coordinate[] = [
        [10, 10, 5],
        [20, 20, 10],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      expect(setCoordinatesSpy).toHaveBeenCalledWith(coordinates, 'XYZ');
    }));

    it('should handle layout change together with coordinates change', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance() as MultiPoint;
      const setFlatCoordinatesSpy = vi.spyOn(multiPoint, 'setFlatCoordinates');

      testComponent.layout.set('XY');
      testComponent.coordinates.set([5, 5, 15, 15]);
      fixture.detectChanges();

      expect(setFlatCoordinatesSpy).toHaveBeenCalledWith('XY', [5, 5, 15, 15]);
    }));
  });

  describe('wolProperties Binding', () => {
    it('should not set properties initially when undefined', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.get('customProp')).toBeUndefined();
    }));

    it('should set properties when input has initial value', fakeAsync(() => {
      const properties: WolProperties = { name: 'test-multi-point', id: 321 };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.get('name')).toBe('test-multi-point');
      expect(multiPoint?.get('id')).toBe(321);
    }));

    it('should update properties when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const properties: WolProperties = { type: 'markers', category: 'poi' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.get('type')).toBe('markers');
      expect(multiPoint?.get('category')).toBe('poi');
    }));

    it('should handle undefined properties update', fakeAsync(() => {
      const properties: WolProperties = { name: 'test' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      const multiPoint = multiPointGeometryComponent.getInstance();
      // Properties should remain when set to undefined
      expect(multiPoint?.get('name')).toBe('test');
    }));

    it('should handle complex property values', fakeAsync(() => {
      const properties: WolProperties = {
        metadata: { source: 'survey' },
        ids: [1, 2, 3],
        enabled: true,
        count: 3,
      };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.get('metadata')).toEqual({ source: 'survey' });
      expect(multiPoint?.get('ids')).toEqual([1, 2, 3]);
      expect(multiPoint?.get('enabled')).toBe(true);
      expect(multiPoint?.get('count')).toBe(3);
    }));
  });

  describe('Output Events', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPointGeometryComponent.wolChange, 'emit');
      const multiPoint = multiPointGeometryComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      multiPoint?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPointGeometryComponent.wolError, 'emit');
      const multiPoint = multiPointGeometryComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      multiPoint?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));

    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPointGeometryComponent.wolPropertyChange, 'emit');
      const multiPoint = multiPointGeometryComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      multiPoint?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit change event when coordinates are modified', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPointGeometryComponent.wolChange, 'emit');
      const multiPoint = multiPointGeometryComponent.getInstance();

      multiPoint?.setCoordinates([
        [50, 50],
        [100, 100],
      ]);

      expect(emitSpy).toHaveBeenCalled();
    }));

    it('should call output handlers when events occur', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const onChangeSpy = vi.spyOn(testComponent, 'onChange');
      const onErrorSpy = vi.spyOn(testComponent, 'onError');
      const onPropertyChangeSpy = vi.spyOn(testComponent, 'onPropertyChange');

      const multiPoint = multiPointGeometryComponent.getInstance();

      multiPoint?.dispatchEvent(new BaseEvent('change'));
      expect(onChangeSpy).toHaveBeenCalled();

      multiPoint?.dispatchEvent(new BaseEvent('error'));
      expect(onErrorSpy).toHaveBeenCalled();

      multiPoint?.dispatchEvent(new ObjectEvent('propertychange', 'key', 'value'));
      expect(onPropertyChangeSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance Method', () => {
    it('should return MultiPoint instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance = multiPointGeometryComponent.getInstance();
      expect(instance).toBeInstanceOf(MultiPoint);
    }));

    it('should return the same instance on multiple calls', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance1 = multiPointGeometryComponent.getInstance();
      const instance2 = multiPointGeometryComponent.getInstance();

      expect(instance1).toBe(instance2);
    }));
  });

  describe('Destroy Lifecycle', () => {
    it('should clear geometry from feature on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(multiPoint);

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(featureComponent.getInstance()?.getGeometry()).toBeUndefined();
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(multiPointGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(multiPointGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should clean up event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiPointGeometryComponent.wolChange, 'emit');

      fixture.destroy();

      // Try to trigger event after destroy
      const multiPoint = new MultiPoint([
        [0, 0],
        [10, 10],
      ]);
      multiPoint.dispatchEvent(new BaseEvent('change'));

      expect(emitSpy).not.toHaveBeenCalled();
    }));
  });

  describe('Edge Cases', () => {
    it('should handle rapid coordinate changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      for (let i = 0; i < 10; i++) {
        testComponent.coordinates.set([
          [i, i],
          [i * 2, i * 2],
        ]);
        fixture.detectChanges();
      }

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getCoordinates()).toEqual([
        [9, 9],
        [18, 18],
      ]);
    }));

    it('should maintain properties after coordinate updates', fakeAsync(() => {
      const properties: WolProperties = { id: 'multi-point-1', persistent: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [50, 50],
        [100, 100],
      ]);
      fixture.detectChanges();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.get('id')).toBe('multi-point-1');
      expect(multiPoint?.get('persistent')).toBe(true);
    }));

    it('should handle coordinates at same location', fakeAsync(() => {
      testComponent.coordinates.set([
        [10, 10],
        [10, 10],
        [10, 10],
      ]);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getPoints().length).toBe(3);
    }));

    it('should handle very dense point cloud', fakeAsync(() => {
      const coordinates: Coordinate[] = [];
      for (let i = 0; i < 1000; i++) {
        coordinates.push([Math.random() * 100, Math.random() * 100]);
      }

      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getPoints().length).toBe(1000);
    }));
  });

  describe('Integration with Feature', () => {
    it('should update feature geometry when multi-point changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[] = [
        [25, 25],
        [75, 75],
        [125, 125],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry() as MultiPoint;

      expect(geometry?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should reflect multi-point geometry in feature properties', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(multiPoint);
      expect(feature?.getGeometry()?.getType()).toBe('MultiPoint');
    }));
  });

  describe('Geometry Calculations', () => {
    it('should calculate extent correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0],
        [100, 50],
        [50, 100],
      ]);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      const extent = multiPoint?.getExtent();

      expect(extent).toEqual([0, 0, 100, 100]);
    }));

    it('should update extent when coordinates change', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [0, 0],
        [50, 50],
      ]);
      fixture.detectChanges();

      const multiPoint = multiPointGeometryComponent.getInstance();
      expect(multiPoint?.getExtent()).toEqual([0, 0, 50, 50]);

      testComponent.coordinates.set([
        [0, 0],
        [100, 100],
      ]);
      fixture.detectChanges();

      expect(multiPoint?.getExtent()).toEqual([0, 0, 100, 100]);
    }));

    it('should handle extent for single point', fakeAsync(() => {
      testComponent.coordinates.set([[25, 25]]);
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      const extent = multiPoint?.getExtent();

      expect(extent).toEqual([25, 25, 25, 25]);
    }));
  });

  describe('Point Access', () => {
    it('should get individual points', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      const points = multiPoint?.getPoints();

      expect(points?.length).toBe(3);
      expect(points?.[0]).toBeInstanceOf(Point);
      expect(points?.[1]).toBeInstanceOf(Point);
      expect(points?.[2]).toBeInstanceOf(Point);
    }));

    it('should get point at specific index', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      const firstPoint = multiPoint?.getPoint(0);
      const secondPoint = multiPoint?.getPoint(1);
      const thirdPoint = multiPoint?.getPoint(2);

      expect(firstPoint?.getCoordinates()).toEqual([0, 0]);
      expect(secondPoint?.getCoordinates()).toEqual([10, 10]);
      expect(thirdPoint?.getCoordinates()).toEqual([20, 20]);
    }));

    it('should get all coordinates', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      const coordinates = multiPoint?.getCoordinates();

      expect(coordinates).toEqual([
        [0, 0],
        [10, 10],
        [20, 20],
      ]);
    }));
  });

  describe('Coordinate Manipulation', () => {
    it('should support appending coordinates', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiPoint = multiPointGeometryComponent.getInstance();
      multiPoint?.appendPoint(new Point([30, 30]));

      const coordinates = multiPoint?.getCoordinates();
      expect(coordinates?.length).toBe(4);
      expect(coordinates?.[3]).toEqual([30, 30]);
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
              <wol-multi-point-geometry
                [wolCoordinates]="coordinates()"
                [wolLayout]="layout()"
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
    WolMultiPointGeometryComponent,
  ],
})
export class BasicMultiPointGeometryComponent {
  coordinates = signal<Coordinate[] | number[]>([
    [0, 0],
    [10, 10],
    [20, 20],
  ]);
  layout = signal<GeometryLayout | undefined>(undefined);
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
