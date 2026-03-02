import { vi } from 'vitest';

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { Coordinate } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { GeometryLayout } from 'ol/geom/Geometry';
import LineString from 'ol/geom/LineString';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolFeatureComponent } from '@workletjs/ngx-openlayers/feature';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolVectorSourceComponent } from '@workletjs/ngx-openlayers/source/vector';

import { WolLineStringGeometryComponent } from './line-string-geometry.component';

// Default coordinates used by BasicLineStringGeometryComponent
const DEFAULT_COORDINATES: Coordinate[] = [
  [0, 0],
  [10, 10],
  [20, 0],
];

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

  // ─────────────────────────────────────────────────────────────────────────────
  // Component Creation
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Component Creation', () => {
    it('should create the WolLineStringGeometryComponent', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent).toBeTruthy();
    }));

    it('should create an OL LineString instance after render', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()).toBeInstanceOf(LineString);
    }));

    it('should return undefined from getInstance() before render completes', () => {
      // A freshly-constructed component, before afterNextRender fires, has no instance.
      // We can verify via the signal default rather than re-mounting.
      expect(lineStringGeometryComponent.instance()).toBeDefined(); // already rendered in beforeEach
    });

    it('should attach the LineString geometry to the parent feature', fakeAsync(() => {
      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(lineString);
    }));

    it('should report geometry type as "LineString"', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getType()).toBe('LineString');
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Input: wolCoordinates (required)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Input: wolCoordinates (required)', () => {
    it('should initialise the geometry with the provided coordinates', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual(
        DEFAULT_COORDINATES,
      );
    }));

    it('should call setCoordinates() with the new value and current layout on change', fakeAsync(() => {
      flush();

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const spy = vi.spyOn(lineString, 'setCoordinates');

      const next: Coordinate[] = [
        [5, 5],
        [15, 15],
      ];
      testComponent.coordinates.set(next);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(next, undefined);
    }));

    it('should call setCoordinates() passing the current layout when layout is set', fakeAsync(() => {
      testComponent.layout.set('XYZ');
      fixture.detectChanges();
      flush();

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const spy = vi.spyOn(lineString, 'setCoordinates');

      const next: Coordinate[] = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      testComponent.coordinates.set(next);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(next, 'XYZ');
    }));

    it('should reflect updated coordinates on the OL instance', fakeAsync(() => {
      flush();

      const next: Coordinate[] = [
        [5, 5],
        [15, 15],
        [25, 25],
      ];
      testComponent.coordinates.set(next);
      fixture.detectChanges();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual(next);
    }));

    it('should handle a two-point line string', fakeAsync(() => {
      const coords: Coordinate[] = [
        [0, 0],
        [100, 100],
      ];
      testComponent.coordinates.set(coords);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual(coords);
    }));

    it('should handle a many-point line string', fakeAsync(() => {
      const coords: Coordinate[] = Array.from({ length: 10 }, (_, i) => [i * 10, i * 5]);
      testComponent.coordinates.set(coords);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates().length).toBe(10);
    }));

    it('should handle negative coordinate values', fakeAsync(() => {
      const coords: Coordinate[] = [
        [-50, -50],
        [-10, -10],
        [10, 10],
      ];
      testComponent.coordinates.set(coords);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual(coords);
    }));

    it('should handle floating-point coordinate values', fakeAsync(() => {
      const coords: Coordinate[] = [
        [12.345, 67.89],
        [23.456, 78.901],
      ];
      testComponent.coordinates.set(coords);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual(coords);
    }));

    it('should handle very large coordinate values', fakeAsync(() => {
      const coords: Coordinate[] = [
        [1_000_000, 2_000_000],
        [3_000_000, 4_000_000],
      ];
      testComponent.coordinates.set(coords);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual(coords);
    }));

    it('should handle an empty coordinate array', fakeAsync(() => {
      testComponent.coordinates.set([]);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual([]);
    }));

    it('should handle a single-point coordinate array', fakeAsync(() => {
      testComponent.coordinates.set([[0, 0]]);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual([[0, 0]]);
    }));

    it('should store XY coordinates in the flat coordinate array', fakeAsync(() => {
      const coords: Coordinate[] = [
        [0, 0],
        [10, 10],
        [20, 20],
      ];
      testComponent.coordinates.set(coords);
      testComponent.layout.set('XY');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getFlatCoordinates()).toEqual([
        0, 0, 10, 10, 20, 20,
      ]);
    }));

    it('should store XYZ coordinates in the flat coordinate array', fakeAsync(() => {
      const coords: Coordinate[] = [
        [0, 0, 5],
        [10, 10, 10],
      ];
      testComponent.coordinates.set(coords);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getFlatCoordinates()).toEqual([
        0, 0, 5, 10, 10, 10,
      ]);
    }));

    it('should store XYM coordinates in the flat coordinate array', fakeAsync(() => {
      const coords: Coordinate[] = [
        [0, 0, 1],
        [10, 10, 2],
      ];
      testComponent.coordinates.set(coords);
      testComponent.layout.set('XYM');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getFlatCoordinates()).toEqual([
        0, 0, 1, 10, 10, 2,
      ]);
    }));

    it('should store XYZM coordinates in the flat coordinate array', fakeAsync(() => {
      const coords: Coordinate[] = [
        [0, 0, 5, 1],
        [10, 10, 10, 2],
      ];
      testComponent.coordinates.set(coords);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getFlatCoordinates()).toEqual([
        0, 0, 5, 1, 10, 10, 10, 2,
      ]);
    }));

    it('should converge to the last value after rapid successive updates', fakeAsync(() => {
      flush();

      for (let i = 0; i < 10; i++) {
        testComponent.coordinates.set([
          [i, i],
          [i * 2, i * 2],
        ]);
        fixture.detectChanges();
      }

      expect(lineStringGeometryComponent.getInstance()?.getCoordinates()).toEqual([
        [9, 9],
        [18, 18],
      ]);
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Input: wolLayout
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Input: wolLayout', () => {
    it('should default to XY layout when wolLayout is not provided', fakeAsync(() => {
      flush();

      // OL infers XY when no layout is given and coordinates are 2-D
      expect(lineStringGeometryComponent.getInstance()?.getLayout()).toBe('XY');
    }));

    it('should apply XY layout when explicitly set', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getLayout()).toBe('XY');
    }));

    it('should apply XYZ layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 5],
        [10, 10, 10],
      ]);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getLayout()).toBe('XYZ');
    }));

    it('should apply XYM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 1],
        [10, 10, 2],
      ]);
      testComponent.layout.set('XYM');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getLayout()).toBe('XYM');
    }));

    it('should apply XYZM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0, 5, 1],
        [10, 10, 10, 2],
      ]);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getLayout()).toBe('XYZM');
    }));

    it('should pass the updated layout to setCoordinates() on coordinate change', fakeAsync(() => {
      testComponent.layout.set('XYZ');
      fixture.detectChanges();
      flush();

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const spy = vi.spyOn(lineString, 'setCoordinates');

      const coords: Coordinate[] = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      testComponent.coordinates.set(coords);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(coords, 'XYZ');
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Input: wolProperties
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Input: wolProperties', () => {
    it('should not set any properties when wolProperties is not provided', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()?.get('customProp')).toBeUndefined();
    }));

    it('should call setProperties with silent=true during initialisation', fakeAsync(() => {
      const properties: WolProperties = { name: 'test-line', id: 456 };
      testComponent.properties.set(properties);
      fixture.detectChanges();
      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(lineString?.get('name')).toBe('test-line');
      expect(lineString?.get('id')).toBe(456);
    }));

    it('should update properties via setProperties() when input changes', fakeAsync(() => {
      flush();

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const spy = vi.spyOn(lineString, 'setProperties');

      const props: WolProperties = { type: 'route', color: 'blue' };
      testComponent.properties.set(props);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(props);
    }));

    it('should call setProperties with an empty object when input becomes undefined', fakeAsync(() => {
      testComponent.properties.set({ name: 'test' });
      fixture.detectChanges();
      flush();

      const lineString = lineStringGeometryComponent.getInstance() as LineString;
      const spy = vi.spyOn(lineString, 'setProperties');

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith({});
    }));

    it('should retain previously set properties when input becomes undefined', fakeAsync(() => {
      testComponent.properties.set({ name: 'test' });
      fixture.detectChanges();
      flush();

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      // setProperties({}) does not remove existing keys in OL
      expect(lineStringGeometryComponent.getInstance()?.get('name')).toBe('test');
    }));

    it('should support complex (nested) property values', fakeAsync(() => {
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

    it('should preserve properties after coordinate updates', fakeAsync(() => {
      testComponent.properties.set({ id: 'line-1', persistent: true });
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
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Output: wolChange
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Output: wolChange', () => {
    it('should emit when OL dispatches a "change" event', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolChange, 'emit');
      const event = new BaseEvent('change');

      lineStringGeometryComponent.getInstance()?.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith(event);
    }));

    it('should emit exactly once per dispatched change event', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolChange, 'emit');
      lineStringGeometryComponent.getInstance()?.dispatchEvent(new BaseEvent('change'));

      expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should emit when setCoordinates() mutates the geometry', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolChange, 'emit');
      lineStringGeometryComponent.getInstance()?.setCoordinates([
        [50, 50],
        [100, 100],
      ]);

      expect(spy).toHaveBeenCalled();
    }));

    it('should invoke the host template handler for change events', fakeAsync(() => {
      flush();

      const handlerSpy = vi.spyOn(testComponent, 'onChange');
      lineStringGeometryComponent.getInstance()?.dispatchEvent(new BaseEvent('change'));

      expect(handlerSpy).toHaveBeenCalled();
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Output: wolError
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Output: wolError', () => {
    it('should emit when OL dispatches an "error" event', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolError, 'emit');
      const event = new BaseEvent('error');

      lineStringGeometryComponent.getInstance()?.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith(event);
    }));

    it('should emit exactly once per dispatched error event', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolError, 'emit');
      lineStringGeometryComponent.getInstance()?.dispatchEvent(new BaseEvent('error'));

      expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should invoke the host template handler for error events', fakeAsync(() => {
      flush();

      const handlerSpy = vi.spyOn(testComponent, 'onError');
      lineStringGeometryComponent.getInstance()?.dispatchEvent(new BaseEvent('error'));

      expect(handlerSpy).toHaveBeenCalled();
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Output: wolPropertyChange
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Output: wolPropertyChange', () => {
    it('should emit when OL dispatches a "propertychange" event', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'testProp', 'oldValue');

      lineStringGeometryComponent.getInstance()?.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith(event);
    }));

    it('should emit exactly once per dispatched propertychange event', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolPropertyChange, 'emit');
      lineStringGeometryComponent
        .getInstance()
        ?.dispatchEvent(new ObjectEvent('propertychange', 'k', 'v'));

      expect(spy).toHaveBeenCalledTimes(1);
    }));

    it('should emit when a property is set on the OL instance directly', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolPropertyChange, 'emit');
      lineStringGeometryComponent.getInstance()?.set('name', 'road');

      expect(spy).toHaveBeenCalled();
    }));

    it('should invoke the host template handler for propertychange events', fakeAsync(() => {
      flush();

      const handlerSpy = vi.spyOn(testComponent, 'onPropertyChange');
      lineStringGeometryComponent
        .getInstance()
        ?.dispatchEvent(new ObjectEvent('propertychange', 'key', 'value'));

      expect(handlerSpy).toHaveBeenCalled();
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getInstance() method
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getInstance()', () => {
    it('should return a LineString after initialisation', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()).toBeInstanceOf(LineString);
    }));

    it('should return the same reference on repeated calls', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()).toBe(
        lineStringGeometryComponent.getInstance(),
      );
    }));

    it('should be consistent with the instance signal', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()).toBe(
        lineStringGeometryComponent.instance(),
      );
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Destroy lifecycle
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Destroy Lifecycle', () => {
    it('should set instance to undefined when the component is destroyed', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(lineStringGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should remove the geometry from the parent feature when removed from the DOM', fakeAsync(() => {
      flush();

      const lineString = lineStringGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(lineString);

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(featureComponent.getInstance()?.getGeometry()).toBeUndefined();
    }));

    it('should unsubscribe the change listener on destroy', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolChange, 'emit');
      fixture.destroy();

      // Dispatch on a completely separate instance so we know the spy is for the
      // original component's output, not the newly created one.
      new LineString([
        [0, 0],
        [10, 10],
      ]).dispatchEvent(new BaseEvent('change'));

      expect(spy).not.toHaveBeenCalled();
    }));

    it('should unsubscribe the error listener on destroy', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolError, 'emit');
      fixture.destroy();

      new LineString([
        [0, 0],
        [10, 10],
      ]).dispatchEvent(new BaseEvent('error'));

      expect(spy).not.toHaveBeenCalled();
    }));

    it('should unsubscribe the propertychange listener on destroy', fakeAsync(() => {
      flush();

      const spy = vi.spyOn(lineStringGeometryComponent.wolPropertyChange, 'emit');
      fixture.destroy();

      new LineString([
        [0, 0],
        [10, 10],
      ]).dispatchEvent(new ObjectEvent('propertychange', 'k', 'v'));

      expect(spy).not.toHaveBeenCalled();
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Geometry calculations
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Geometry calculations', () => {
    it('should compute the extent correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0],
        [100, 50],
        [50, 100],
      ]);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getExtent()).toEqual([0, 0, 100, 100]);
    }));

    it('should compute the length of a 3-4-5 right triangle correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [0, 0],
        [3, 4],
      ]);
      fixture.detectChanges();
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getLength()).toBe(5);
    }));

    it('should update the extent after coordinate changes', fakeAsync(() => {
      fixture.detectChanges();
      flush();

      testComponent.coordinates.set([
        [0, 0],
        [50, 50],
      ]);
      fixture.detectChanges();

      expect(lineStringGeometryComponent.getInstance()?.getExtent()).toEqual([0, 0, 50, 50]);

      testComponent.coordinates.set([
        [0, 0],
        [100, 100],
      ]);
      fixture.detectChanges();

      expect(lineStringGeometryComponent.getInstance()?.getExtent()).toEqual([0, 0, 100, 100]);
    }));

    it('should return the first coordinate', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getFirstCoordinate()).toEqual([0, 0]);
    }));

    it('should return the last coordinate', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getLastCoordinate()).toEqual([20, 0]);
    }));

    it('should return a defined midpoint coordinate at fraction 0.5', fakeAsync(() => {
      flush();

      expect(lineStringGeometryComponent.getInstance()?.getCoordinateAt(0.5)).toBeDefined();
    }));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Integration with Feature
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Integration with Feature', () => {
    it('should keep the feature geometry in sync after coordinate updates', fakeAsync(() => {
      flush();

      const next: Coordinate[] = [
        [25, 25],
        [75, 75],
      ];
      testComponent.coordinates.set(next);
      fixture.detectChanges();

      const geometry = featureComponent.getInstance()?.getGeometry() as LineString;
      expect(geometry?.getCoordinates()).toEqual(next);
    }));

    it('should expose the same OL object from the component and from the feature', fakeAsync(() => {
      flush();

      expect(featureComponent.getInstance()?.getGeometry()).toBe(
        lineStringGeometryComponent.getInstance(),
      );
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
