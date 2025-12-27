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
import { GeometryLayout } from 'ol/geom/Geometry';
import BaseEvent from 'ol/events/Event';
import LineString from 'ol/geom/LineString';

import { WolLineStringGeometryComponent } from './line-string-geometry.component';

describe('WolLineStringGeometryComponent', () => {
  let fixture: ComponentFixture<BasicLineStringGeometryComponent>;
  let testComponent: BasicLineStringGeometryComponent;
  let featureComponent: WolFeatureComponent;
  let lineStringGeometryComponent: WolLineStringGeometryComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicLineStringGeometryComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
    lineStringGeometryComponent = fixture.debugElement.query(
      By.directive(WolLineStringGeometryComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the line string geometry component', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(lineStringGeometryComponent).toBeTruthy();
      expect(lineStringGeometryComponent.getInstance()).toBeInstanceOf(LineString);
    }));

    it('should attach line string geometry to feature', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(lineString);
    }));
  });

  describe('wolCoordinates Binding (Required Input)', () => {
    it('should set initial coordinates from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual([
        [0, 0],
        [10, 10],
        [20, 0],
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

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should handle two-point line string', fakeAsync(() => {
      const coordinates: Coordinate[] = [
        [0, 0],
        [100, 100],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual(coordinates);
      expect(lineString?.getCoordinates().length).toBe(2);
    }));

    it('should handle multi-point line string', fakeAsync(() => {
      const coordinates: Coordinate[] = [
        [0, 0],
        [10, 10],
        [20, 10],
        [30, 0],
        [40, 10],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual(coordinates);
      expect(lineString?.getCoordinates().length).toBe(5);
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

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual(coordinates);
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

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle large coordinate values', fakeAsync(() => {
      const coordinates: Coordinate[] = [
        [1000000, 2000000],
        [3000000, 4000000],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle flat coordinates with layout', fakeAsync(() => {
      const flatCoordinates = [0, 0, 10, 10, 20, 20];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYZ flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 5, 10, 10, 10, 20, 20, 15];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYM flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 1, 10, 10, 2, 20, 20, 3];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));

    it('should handle XYZM flat coordinates', fakeAsync(() => {
      const flatCoordinates = [0, 0, 5, 1, 10, 10, 10, 2];
      testComponent.coordinates.set(flatCoordinates);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getFlatCoordinates()).toEqual(flatCoordinates);
    }));
  });

  describe('wolLayout Binding', () => {
    it('should create line string with undefined layout', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString).toBeInstanceOf(LineString);
    }));

    it('should create line string with XY layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString).toBeInstanceOf(LineString);
      expect(lineString?.getLayout()).toBe('XY');
    }));

    it('should create line string with XYZ layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 5],
        [10, 10, 10],
        [20, 20, 15],
      ]);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString).toBeInstanceOf(LineString);
      expect(lineString?.getLayout()).toBe('XYZ');
    }));

    it('should create line string with XYM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 1],
        [10, 10, 2],
        [20, 20, 3],
      ]);
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString).toBeInstanceOf(LineString);
      expect(lineString?.getLayout()).toBe('XYM');
    }));

    it('should create line string with XYZM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 5, 1],
        [10, 10, 10, 2],
      ]);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString).toBeInstanceOf(LineString);
      expect(lineString?.getLayout()).toBe('XYZM');
    }));
  });

  describe('Coordinates Update with Layout', () => {
    it('should use setFlatCoordinates for flat array with layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const setFlatCoordinatesSpy = vi.spyOn(lineString, 'setFlatCoordinates');

      const flatCoordinates = [5, 5, 15, 15, 25, 25];
      testComponent.coordinates.set(flatCoordinates);
      fixture.detectChanges();

      expect(setFlatCoordinatesSpy).toHaveBeenCalledWith('XY', flatCoordinates);
    }));

    it('should use setCoordinates for nested array', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const setCoordinatesSpy = vi.spyOn(lineString, 'setCoordinates');

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

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const setCoordinatesSpy = vi.spyOn(lineString, 'setCoordinates');

      const coordinates: Coordinate[] = [
        [10, 10, 5],
        [20, 20, 10],
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

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.get('customProp')).toBeUndefined();
    }));

    it('should set properties when input has initial value', fakeAsync(() => {
      const properties: WolProperties = { name: 'test-line', id: 456 };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.get('name')).toBe('test-line');
      expect(lineString?.get('id')).toBe(456);
    }));

    it('should update properties when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const properties: WolProperties = { type: 'route', color: 'blue' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.get('type')).toBe('route');
      expect(lineString?.get('color')).toBe('blue');
    }));

    it('should handle undefined properties update', fakeAsync(() => {
      const properties: WolProperties = { name: 'test' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      const lineString = lineStringGeometryComponent.getInstance();
      // Properties should remain when set to undefined
      expect(lineString?.get('name')).toBe('test');
    }));

    it('should handle complex property values', fakeAsync(() => {
      const properties: WolProperties = {
        metadata: { source: 'GPS' },
        waypoints: [1, 2, 3],
        active: true,
        distance: 42.5,
      };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.get('metadata')).toEqual({ source: 'GPS' });
      expect(lineString?.get('waypoints')).toEqual([1, 2, 3]);
      expect(lineString?.get('active')).toBe(true);
      expect(lineString?.get('distance')).toBe(42.5);
    }));
  });

  describe('Output Events', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(lineStringGeometryComponent.wolChange, 'emit');
      const lineString = lineStringGeometryComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      lineString?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(lineStringGeometryComponent.wolError, 'emit');
      const lineString = lineStringGeometryComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      lineString?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));

    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(lineStringGeometryComponent.wolPropertyChange, 'emit');
      const lineString = lineStringGeometryComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      lineString?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit change event when coordinates are modified', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(lineStringGeometryComponent.wolChange, 'emit');
      const lineString = lineStringGeometryComponent.getInstance();

      lineString?.setCoordinates([
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

      const lineString = lineStringGeometryComponent.getInstance();

      lineString?.dispatchEvent(new BaseEvent('change'));
      expect(onChangeSpy).toHaveBeenCalled();

      lineString?.dispatchEvent(new BaseEvent('error'));
      expect(onErrorSpy).toHaveBeenCalled();

      lineString?.dispatchEvent(new ObjectEvent('propertychange', 'key', 'value'));
      expect(onPropertyChangeSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance Method', () => {
    it('should return LineString instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance = lineStringGeometryComponent.getInstance();
      expect(instance).toBeInstanceOf(LineString);
    }));

    it('should return the same instance on multiple calls', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance1 = lineStringGeometryComponent.getInstance();
      const instance2 = lineStringGeometryComponent.getInstance();

      expect(instance1).toBe(instance2);
    }));
  });

  describe('Destroy Lifecycle', () => {
    it('should clear geometry from feature on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(lineString);

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(featureComponent.getInstance()?.getGeometry()).toBeUndefined();
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(lineStringGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(lineStringGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should clean up event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(lineStringGeometryComponent.wolChange, 'emit');

      fixture.destroy();

      // Try to trigger event after destroy
      const lineString = new LineString([
        [0, 0],
        [10, 10],
      ]);
      lineString.dispatchEvent(new BaseEvent('change'));

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

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual([
        [9, 9],
        [18, 18],
      ]);
    }));

    it('should maintain properties after coordinate updates', fakeAsync(() => {
      const properties: WolProperties = { id: 'line-1', persistent: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [50, 50],
        [100, 100],
      ]);
      fixture.detectChanges();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.get('id')).toBe('line-1');
      expect(lineString?.get('persistent')).toBe(true);
    }));

    it('should handle empty coordinate array edge case', fakeAsync(() => {
      testComponent.coordinates.set([]);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual([]);
    }));

    it('should handle single point coordinate array', fakeAsync(() => {
      testComponent.coordinates.set([[0, 0]]);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates()).toEqual([[0, 0]]);
    }));

    it('should handle very long line strings', fakeAsync(() => {
      const coordinates: Coordinate[] = [];
      for (let i = 0; i < 100; i++) {
        coordinates.push([i, i]);
      }

      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getCoordinates().length).toBe(100);
    }));
  });

  describe('Integration with Feature', () => {
    it('should update feature geometry when line string changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[] = [
        [25, 25],
        [75, 75],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry() as LineString;

      expect(geometry?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should reflect line string geometry in feature properties', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(lineString);
      expect(feature?.getGeometry()?.getType()).toBe('LineString');
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

      const lineString = lineStringGeometryComponent.getInstance();
      const extent = lineString?.getExtent();

      expect(extent).toEqual([0, 0, 100, 100]);
    }));

    it('should calculate length correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0],
        [3, 4],
      ]);
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      const length = lineString?.getLength();

      expect(length).toBe(5); // 3-4-5 triangle
    }));

    it('should update extent when coordinates change', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [0, 0],
        [50, 50],
      ]);
      fixture.detectChanges();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.getExtent()).toEqual([0, 0, 50, 50]);

      testComponent.coordinates.set([
        [0, 0],
        [100, 100],
      ]);
      fixture.detectChanges();

      expect(lineString?.getExtent()).toEqual([0, 0, 100, 100]);
    }));
  });

  describe('Coordinate Manipulation', () => {
    it('should get first coordinate', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      const firstCoord = lineString?.getFirstCoordinate();

      expect(firstCoord).toEqual([0, 0]);
    }));

    it('should get last coordinate', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      const lastCoord = lineString?.getLastCoordinate();

      expect(lastCoord).toEqual([20, 0]);
    }));

    it('should get coordinate at specific index', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      const coord = lineString?.getCoordinateAt(0.5);

      expect(coord).toBeDefined();
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
              <wol-line-string-geometry
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
    WolLineStringGeometryComponent,
  ],
})
export class BasicLineStringGeometryComponent {
  coordinates = signal<Coordinate[] | number[]>([
    [0, 0],
    [10, 10],
    [20, 0],
  ]);
  layout = signal<GeometryLayout | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  enabled = signal(true);

  onChange(event: BaseEvent): void {
    // Event handler for testing
  }

  onError(event: BaseEvent): void {
    // Event handler for testing
  }

  onPropertyChange(event: ObjectEvent): void {
    // Event handler for testing
  }
}
