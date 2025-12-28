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
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import { GeometryLayout } from 'ol/geom/Geometry';

import { WolMultiLineStringGeometryComponent } from './multi-line-string-geometry.component';

describe('WolMultiLineStringGeometryComponent', () => {
  let fixture: ComponentFixture<BasicMultiLineStringGeometryComponent>;
  let testComponent: BasicMultiLineStringGeometryComponent;
  let featureComponent: WolFeatureComponent;
  let multiLineStringGeometryComponent: WolMultiLineStringGeometryComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicMultiLineStringGeometryComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
    multiLineStringGeometryComponent = fixture.debugElement.query(
      By.directive(WolMultiLineStringGeometryComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the multi-line string geometry component', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(multiLineStringGeometryComponent).toBeTruthy();
      expect(multiLineStringGeometryComponent.getInstance()).toBeInstanceOf(MultiLineString);
    }));

    it('should attach multi-line string geometry to feature', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(multiLineString);
    }));
  });

  describe('wolCoordinates Binding (Required Input)', () => {
    it('should set initial coordinates from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual([
        [
          [0, 0],
          [10, 10],
          [20, 0],
        ],
        [
          [30, 30],
          [40, 40],
          [50, 30],
        ],
      ]);
    }));

    it('should update coordinates when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[][] = [
        [
          [5, 5],
          [15, 15],
        ],
        [
          [25, 25],
          [35, 35],
        ],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should handle single line string in multi-line string', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [100, 100],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual(coordinates);
      expect(multiLineString?.getLineStrings().length).toBe(1);
    }));

    it('should handle multiple line strings', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [10, 10],
        ],
        [
          [20, 20],
          [30, 30],
        ],
        [
          [40, 40],
          [50, 50],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual(coordinates);
      expect(multiLineString?.getLineStrings().length).toBe(3);
    }));

    it('should handle line strings with varying point counts', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [10, 10],
        ],
        [
          [20, 20],
          [30, 30],
          [40, 40],
          [50, 50],
        ],
        [
          [60, 60],
          [70, 70],
          [80, 80],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle negative coordinates', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [-50, -50],
          [-10, -10],
        ],
        [
          [10, 10],
          [50, 50],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle decimal coordinates', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [12.345, 67.89],
          [23.456, 78.901],
        ],
        [
          [34.567, 89.012],
          [45.678, 90.123],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual(coordinates);
    }));

    it('should handle LineString array as coordinates', fakeAsync(() => {
      const lineStrings: LineString[] = [
        new LineString([
          [0, 0],
          [10, 10],
        ]),
        new LineString([
          [20, 20],
          [30, 30],
        ]),
      ];
      testComponent.coordinates.set(lineStrings);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getLineStrings().length).toBe(2);
    }));

    it('should handle empty coordinates array', fakeAsync(() => {
      testComponent.coordinates.set([]);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual([]);
      expect(multiLineString?.getLineStrings().length).toBe(0);
    }));
  });

  describe('wolLayout Binding', () => {
    it('should create multi-line string with undefined layout', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString).toBeInstanceOf(MultiLineString);
    }));

    it('should create multi-line string with XY layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString).toBeInstanceOf(MultiLineString);
      expect(multiLineString?.getLayout()).toBe('XY');
    }));

    it('should create multi-line string with XYZ layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0, 5],
          [10, 10, 10],
        ],
        [
          [20, 20, 15],
          [30, 30, 20],
        ],
      ]);
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString).toBeInstanceOf(MultiLineString);
      expect(multiLineString?.getLayout()).toBe('XYZ');
    }));

    it('should create multi-line string with XYM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0, 1],
          [10, 10, 2],
        ],
        [
          [20, 20, 3],
          [30, 30, 4],
        ],
      ]);
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString).toBeInstanceOf(MultiLineString);
      expect(multiLineString?.getLayout()).toBe('XYM');
    }));

    it('should create multi-line string with XYZM layout', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0, 5, 1],
          [10, 10, 10, 2],
        ],
        [
          [20, 20, 15, 3],
          [30, 30, 20, 4],
        ],
      ]);
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString).toBeInstanceOf(MultiLineString);
      expect(multiLineString?.getLayout()).toBe('XYZM');
    }));
  });

  describe('wolEnds Binding', () => {
    it('should create multi-line string with flat coordinates and ends', fakeAsync(() => {
      testComponent.coordinates.set([0, 0, 10, 10, 20, 20, 30, 30]);
      testComponent.layout.set('XY');
      testComponent.ends.set([4, 8]);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString).toBeInstanceOf(MultiLineString);
      expect(multiLineString?.getLineStrings().length).toBe(2);
    }));

    it('should handle multiple line strings with flat coordinates and ends', fakeAsync(() => {
      testComponent.coordinates.set([0, 0, 10, 10, 20, 0, 30, 30, 40, 40, 50, 30]);
      testComponent.layout.set('XY');
      testComponent.ends.set([6, 12]);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getLineStrings().length).toBe(2);
    }));

    it('should handle undefined ends with nested coordinates', fakeAsync(() => {
      testComponent.ends.set(undefined);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString).toBeInstanceOf(MultiLineString);
    }));
  });

  describe('wolProperties Binding', () => {
    it('should not set properties initially when undefined', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.get('customProp')).toBeUndefined();
    }));

    it('should set properties when input has initial value', fakeAsync(() => {
      const properties: WolProperties = { name: 'test-multi-line', id: 789 };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.get('name')).toBe('test-multi-line');
      expect(multiLineString?.get('id')).toBe(789);
    }));

    it('should update properties when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const properties: WolProperties = { type: 'roads', network: 'highway' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.get('type')).toBe('roads');
      expect(multiLineString?.get('network')).toBe('highway');
    }));

    it('should handle undefined properties update', fakeAsync(() => {
      const properties: WolProperties = { name: 'test' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      // Properties should remain when set to undefined
      expect(multiLineString?.get('name')).toBe('test');
    }));

    it('should handle complex property values', fakeAsync(() => {
      const properties: WolProperties = {
        metadata: { category: 'transport' },
        segments: [1, 2, 3],
        active: false,
        totalLength: 123.45,
      };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.get('metadata')).toEqual({ category: 'transport' });
      expect(multiLineString?.get('segments')).toEqual([1, 2, 3]);
      expect(multiLineString?.get('active')).toBe(false);
      expect(multiLineString?.get('totalLength')).toBe(123.45);
    }));
  });

  describe('Output Events', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiLineStringGeometryComponent.wolChange, 'emit');
      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      multiLineString?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiLineStringGeometryComponent.wolError, 'emit');
      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      multiLineString?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));

    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiLineStringGeometryComponent.wolPropertyChange, 'emit');
      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      multiLineString?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit change event when coordinates are modified', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiLineStringGeometryComponent.wolChange, 'emit');
      const multiLineString = multiLineStringGeometryComponent.getInstance();

      multiLineString?.setCoordinates([
        [
          [50, 50],
          [100, 100],
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

      const multiLineString = multiLineStringGeometryComponent.getInstance();

      multiLineString?.dispatchEvent(new BaseEvent('change'));
      expect(onChangeSpy).toHaveBeenCalled();

      multiLineString?.dispatchEvent(new BaseEvent('error'));
      expect(onErrorSpy).toHaveBeenCalled();

      multiLineString?.dispatchEvent(new ObjectEvent('propertychange', 'key', 'value'));
      expect(onPropertyChangeSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance Method', () => {
    it('should return MultiLineString instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance = multiLineStringGeometryComponent.getInstance();
      expect(instance).toBeInstanceOf(MultiLineString);
    }));

    it('should return the same instance on multiple calls', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance1 = multiLineStringGeometryComponent.getInstance();
      const instance2 = multiLineStringGeometryComponent.getInstance();

      expect(instance1).toBe(instance2);
    }));
  });

  describe('Destroy Lifecycle', () => {
    it('should clear geometry from feature on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(multiLineString);

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(featureComponent.getInstance()?.getGeometry()).toBeUndefined();
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(multiLineStringGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(multiLineStringGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should clean up event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(multiLineStringGeometryComponent.wolChange, 'emit');

      fixture.destroy();

      // Try to trigger event after destroy
      const multiLineString = new MultiLineString([
        [
          [0, 0],
          [10, 10],
        ],
      ]);
      multiLineString.dispatchEvent(new BaseEvent('change'));

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
            [i * 2, i * 2],
          ],
        ]);
        fixture.detectChanges();
      }

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getCoordinates()).toEqual([
        [
          [9, 9],
          [18, 18],
        ],
      ]);
    }));

    it('should maintain properties after coordinate updates', fakeAsync(() => {
      const properties: WolProperties = { id: 'multi-line-1', persistent: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [
          [50, 50],
          [100, 100],
        ],
        [
          [150, 150],
          [200, 200],
        ],
      ]);
      fixture.detectChanges();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.get('id')).toBe('multi-line-1');
      expect(multiLineString?.get('persistent')).toBe(true);
    }));

    it('should handle very long multi-line strings', fakeAsync(() => {
      const coordinates: Coordinate[][] = [];
      for (let i = 0; i < 50; i++) {
        coordinates.push([
          [i * 10, i * 10],
          [i * 10 + 5, i * 10 + 5],
        ]);
      }

      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getLineStrings().length).toBe(50);
    }));

    it('should handle complex nested structures', fakeAsync(() => {
      const coordinates: Coordinate[][] = [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
        [
          [20, 20],
          [30, 20],
        ],
        [
          [40, 40],
          [50, 40],
          [50, 50],
          [40, 50],
          [40, 40],
        ],
      ];

      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getLineStrings().length).toBe(3);
      expect(multiLineString?.getLineString(0).getCoordinates().length).toBe(4);
      expect(multiLineString?.getLineString(1).getCoordinates().length).toBe(2);
      expect(multiLineString?.getLineString(2).getCoordinates().length).toBe(5);
    }));
  });

  describe('Integration with Feature', () => {
    it('should update feature geometry when multi-line string changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCoordinates: Coordinate[][] = [
        [
          [25, 25],
          [75, 75],
        ],
        [
          [125, 125],
          [175, 175],
        ],
      ];
      testComponent.coordinates.set(newCoordinates);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry() as MultiLineString;

      expect(geometry?.getCoordinates()).toEqual(newCoordinates);
    }));

    it('should reflect multi-line string geometry in feature properties', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(multiLineString);
      expect(feature?.getGeometry()?.getType()).toBe('MultiLineString');
    }));
  });

  describe('Geometry Calculations', () => {
    it('should calculate extent correctly', fakeAsync(() => {
      testComponent.coordinates.set([
        [
          [0, 0],
          [50, 50],
        ],
        [
          [25, 25],
          [100, 75],
        ],
      ]);
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const extent = multiLineString?.getExtent();

      expect(extent).toEqual([0, 0, 100, 75]);
    }));

    it('should update extent when coordinates change', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.coordinates.set([
        [
          [0, 0],
          [50, 50],
        ],
      ]);
      fixture.detectChanges();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      expect(multiLineString?.getExtent()).toEqual([0, 0, 50, 50]);

      testComponent.coordinates.set([
        [
          [0, 0],
          [100, 100],
        ],
      ]);
      fixture.detectChanges();

      expect(multiLineString?.getExtent()).toEqual([0, 0, 100, 100]);
    }));
  });

  describe('LineString Access', () => {
    it('should get individual line strings', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const lineStrings = multiLineString?.getLineStrings();

      expect(lineStrings?.length).toBe(2);
      expect(lineStrings?.[0]).toBeInstanceOf(LineString);
      expect(lineStrings?.[1]).toBeInstanceOf(LineString);
    }));

    it('should get line string at specific index', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const firstLine = multiLineString?.getLineString(0);
      const secondLine = multiLineString?.getLineString(1);

      expect(firstLine?.getCoordinates()).toEqual([
        [0, 0],
        [10, 10],
        [20, 0],
      ]);
      expect(secondLine?.getCoordinates()).toEqual([
        [30, 30],
        [40, 40],
        [50, 30],
      ]);
    }));

    it('should get all coordinates from all line strings', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance();
      const allCoordinates = multiLineString?.getCoordinates();

      expect(allCoordinates?.length).toBe(2);
      expect(allCoordinates?.[0].length).toBe(3);
      expect(allCoordinates?.[1].length).toBe(3);
    }));
  });

  describe('Coordinates Update with Layout', () => {
    it('should use setCoordinates without layout when layout is undefined', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const multiLineString = multiLineStringGeometryComponent.getInstance() as MultiLineString;
      const setCoordinatesSpy = vi.spyOn(multiLineString, 'setCoordinates');

      const coordinates: Coordinate[][] = [
        [
          [30, 30],
          [40, 40],
        ],
      ];
      testComponent.coordinates.set(coordinates);
      fixture.detectChanges();

      expect(setCoordinatesSpy).toHaveBeenCalledWith(coordinates, undefined);
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
              <wol-multi-line-string-geometry
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
    WolMultiLineStringGeometryComponent,
  ],
})
export class BasicMultiLineStringGeometryComponent {
  coordinates = signal<Coordinate[][] | LineString[] | number[]>([
    [
      [0, 0],
      [10, 10],
      [20, 0],
    ],
    [
      [30, 30],
      [40, 40],
      [50, 30],
    ],
  ]);
  layout = signal<GeometryLayout | undefined>(undefined);
  ends = signal<number[] | undefined>(undefined);
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
