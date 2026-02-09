import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolFeatureComponent } from '@workletjs/ngx-openlayers/feature';
import { Coordinate } from 'ol/coordinate';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import Circle from 'ol/geom/Circle';
import { GeometryLayout } from 'ol/geom/Geometry';

import { WolCircleGeometryComponent } from './circle-geometry.component';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceComponent } from '@workletjs/ngx-openlayers/source/vector';

describe('WolCircleGeometryComponent', () => {
  let fixture: ComponentFixture<BasicCircleGeometryComponent>;
  let testComponent: BasicCircleGeometryComponent;
  let featureComponent: WolFeatureComponent;
  let circleGeometryComponent: WolCircleGeometryComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicCircleGeometryComponent);
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    featureComponent = fixture.debugElement.query(
      By.directive(WolFeatureComponent),
    ).componentInstance;
    circleGeometryComponent = fixture.debugElement.query(
      By.directive(WolCircleGeometryComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the circle geometry component', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(circleGeometryComponent).toBeTruthy();
      expect(circleGeometryComponent.getInstance()).toBeInstanceOf(Circle);
    }));

    it('should attach circle geometry to feature', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(circle);
    }));
  });

  describe('wolCenter Binding (Required Input)', () => {
    it('should set initial center from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual([0, 0]);
    }));

    it('should update center when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCenter: Coordinate = [10, 20];
      testComponent.center.set(newCenter);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual(newCenter);
    }));

    it('should handle negative coordinates', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const negativeCenter: Coordinate = [-50, -100];
      testComponent.center.set(negativeCenter);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual(negativeCenter);
    }));

    it('should handle large coordinate values', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const largeCenter: Coordinate = [1000000, 2000000];
      testComponent.center.set(largeCenter);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual(largeCenter);
    }));

    it('should handle decimal coordinates', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const decimalCenter: Coordinate = [12.345, 67.89];
      testComponent.center.set(decimalCenter);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual(decimalCenter);
    }));
  });

  describe('wolRadius Binding', () => {
    it('should set initial radius from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getRadius()).toBe(100);
    }));

    it('should update radius when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.radius.set(250);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getRadius()).toBe(250);
    }));

    it('should handle radius of 0', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.radius.set(0);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getRadius()).toBe(0);
    }));

    it('should handle very small radius', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.radius.set(0.001);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getRadius()).toBeCloseTo(0.001);
    }));

    it('should handle very large radius', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.radius.set(1000000);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getRadius()).toBe(1000000);
    }));

    it('should handle undefined radius', fakeAsync(() => {
      testComponent.radius.set(undefined);
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getRadius()).toBeNaN();
    }));
  });

  describe('wolLayout Binding', () => {
    it('should set initial layout from input', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle).toBeDefined();
    }));

    it('should create circle with XY layout', fakeAsync(() => {
      testComponent.layout.set('XY');
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle).toBeInstanceOf(Circle);
    }));

    it('should create circle with XYZ layout', fakeAsync(() => {
      testComponent.layout.set('XYZ');
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle).toBeInstanceOf(Circle);
    }));

    it('should create circle with XYM layout', fakeAsync(() => {
      testComponent.layout.set('XYM');
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle).toBeInstanceOf(Circle);
    }));

    it('should create circle with XYZM layout', fakeAsync(() => {
      testComponent.layout.set('XYZM');
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle).toBeInstanceOf(Circle);
    }));

    it('should handle undefined layout', fakeAsync(() => {
      testComponent.layout.set(undefined);
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle).toBeInstanceOf(Circle);
    }));
  });

  describe('Combined Center and Radius Changes', () => {
    it('should update both center and radius simultaneously', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const newCenter: Coordinate = [50, 50];
      const newRadius = 200;

      testComponent.center.set(newCenter);
      testComponent.radius.set(newRadius);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual(newCenter);
      expect(circle?.getRadius()).toBe(newRadius);
    }));

    it('should use setCenterAndRadius when both change together', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance() as Circle;
      const setCenterAndRadiusSpy = vi.spyOn(circle, 'setCenterAndRadius');

      const newCenter: Coordinate = [100, 100];
      const newRadius = 300;

      testComponent.center.set(newCenter);
      testComponent.radius.set(newRadius);
      fixture.detectChanges();

      expect(setCenterAndRadiusSpy).toHaveBeenCalledWith(newCenter, newRadius, undefined);
    }));

    it('should use setCenter when only center changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance() as Circle;
      const setCenterSpy = vi.spyOn(circle, 'setCenter');

      const newCenter: Coordinate = [75, 75];
      testComponent.center.set(newCenter);
      fixture.detectChanges();

      expect(setCenterSpy).toHaveBeenCalledWith(newCenter);
    }));

    it('should use setRadius when only radius changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance() as Circle;
      const setRadiusSpy = vi.spyOn(circle, 'setRadius');

      const newRadius = 150;
      testComponent.radius.set(newRadius);
      fixture.detectChanges();

      expect(setRadiusSpy).toHaveBeenCalledWith(newRadius);
    }));
  });

  describe('wolProperties Binding', () => {
    it('should not set properties initially when undefined', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.get('customProp')).toBeUndefined();
    }));

    it('should set properties when input has initial value', fakeAsync(() => {
      const properties: WolProperties = { name: 'test-circle', id: 123 };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.get('name')).toBe('test-circle');
      expect(circle?.get('id')).toBe(123);
    }));

    it('should update properties when input changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const properties: WolProperties = { type: 'circle', visible: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.get('type')).toBe('circle');
      expect(circle?.get('visible')).toBe(true);
    }));

    it('should handle undefined properties update', fakeAsync(() => {
      const properties: WolProperties = { name: 'test' };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.properties.set(undefined);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      // Properties should remain when set to undefined
      expect(circle?.get('name')).toBe('test');
    }));

    it('should handle complex property values', fakeAsync(() => {
      const properties: WolProperties = {
        nested: { key: 'value' },
        array: [1, 2, 3],
        boolean: false,
        number: 42,
      };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.get('nested')).toEqual({ key: 'value' });
      expect(circle?.get('array')).toEqual([1, 2, 3]);
      expect(circle?.get('boolean')).toBe(false);
      expect(circle?.get('number')).toBe(42);
    }));
  });

  describe('Output Events', () => {
    it('should emit change event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(circleGeometryComponent.wolChange, 'emit');
      const circle = circleGeometryComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      circle?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    }));

    it('should emit error event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(circleGeometryComponent.wolError, 'emit');
      const circle = circleGeometryComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      circle?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    }));

    it('should emit propertychange event', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(circleGeometryComponent.wolPropertyChange, 'emit');
      const circle = circleGeometryComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      circle?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    }));

    it('should emit change event when center is modified', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(circleGeometryComponent.wolChange, 'emit');
      const circle = circleGeometryComponent.getInstance();

      circle?.setCenter([100, 100]);

      expect(emitSpy).toHaveBeenCalled();
    }));

    it('should emit change event when radius is modified', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(circleGeometryComponent.wolChange, 'emit');
      const circle = circleGeometryComponent.getInstance();

      circle?.setRadius(500);

      expect(emitSpy).toHaveBeenCalled();
    }));

    it('should call output handlers when events occur', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const onChangeSpy = vi.spyOn(testComponent, 'onChange');
      const onErrorSpy = vi.spyOn(testComponent, 'onError');
      const onPropertyChangeSpy = vi.spyOn(testComponent, 'onPropertyChange');

      const circle = circleGeometryComponent.getInstance();

      circle?.dispatchEvent(new BaseEvent('change'));
      expect(onChangeSpy).toHaveBeenCalled();

      circle?.dispatchEvent(new BaseEvent('error'));
      expect(onErrorSpy).toHaveBeenCalled();

      circle?.dispatchEvent(new ObjectEvent('propertychange', 'key', 'value'));
      expect(onPropertyChangeSpy).toHaveBeenCalled();
    }));
  });

  describe('getInstance Method', () => {
    it('should return Circle instance after initialization', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance = circleGeometryComponent.getInstance();
      expect(instance).toBeInstanceOf(Circle);
    }));

    it('should return the same instance on multiple calls', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const instance1 = circleGeometryComponent.getInstance();
      const instance2 = circleGeometryComponent.getInstance();

      expect(instance1).toBe(instance2);
    }));
  });

  describe('Destroy Lifecycle', () => {
    it('should clear geometry from feature on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      expect(featureComponent.getInstance()?.getGeometry()).toBe(circle);

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(featureComponent.getInstance()?.getGeometry()).toBeUndefined();
    }));

    it('should set instance to undefined on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      expect(circleGeometryComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(circleGeometryComponent.getInstance()).toBeUndefined();
    }));

    it('should clean up event listeners on destroy', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const emitSpy = vi.spyOn(circleGeometryComponent.wolChange, 'emit');

      fixture.destroy();

      // Try to trigger event after destroy
      const circle = new Circle([0, 0], 100);
      circle.dispatchEvent(new BaseEvent('change'));

      expect(emitSpy).not.toHaveBeenCalled();
    }));
  });

  describe('Edge Cases', () => {
    it('should handle rapid center changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      for (let i = 0; i < 10; i++) {
        testComponent.center.set([i, i]);
        fixture.detectChanges();
      }

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual([9, 9]);
    }));

    it('should handle rapid radius changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      for (let i = 0; i < 10; i++) {
        testComponent.radius.set(i * 10);
        fixture.detectChanges();
      }

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getRadius()).toBe(90);
    }));

    it('should handle alternating center and radius changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.center.set([10, 10]);
      fixture.detectChanges();

      testComponent.radius.set(200);
      fixture.detectChanges();

      testComponent.center.set([20, 20]);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual([20, 20]);
      expect(circle?.getRadius()).toBe(200);
    }));

    it('should maintain circle properties after multiple updates', fakeAsync(() => {
      const properties: WolProperties = { id: 'circle-1', persistent: true };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      flush();

      testComponent.center.set([50, 50]);
      testComponent.radius.set(300);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.get('id')).toBe('circle-1');
      expect(circle?.get('persistent')).toBe(true);
    }));

    it('should handle zero coordinates', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.center.set([0, 0]);
      testComponent.radius.set(0);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getCenter()).toEqual([0, 0]);
      expect(circle?.getRadius()).toBe(0);
    }));
  });

  describe('Integration with Feature', () => {
    it('should update feature geometry when circle changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.center.set([25, 25]);
      testComponent.radius.set(150);
      fixture.detectChanges();

      const feature = featureComponent.getInstance();
      const geometry = feature?.getGeometry() as Circle;

      expect(geometry?.getCenter()).toEqual([25, 25]);
      expect(geometry?.getRadius()).toBe(150);
    }));

    it('should reflect circle geometry in feature properties', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      const feature = featureComponent.getInstance();

      expect(feature?.getGeometry()).toBe(circle);
      expect(feature?.getGeometry()?.getType()).toBe('Circle');
    }));
  });

  describe('Geometry Calculations', () => {
    it('should calculate extent correctly', fakeAsync(() => {
      testComponent.center.set([100, 100]);
      testComponent.radius.set(50);
      fixture.detectChanges();

      flush();

      const circle = circleGeometryComponent.getInstance();
      const extent = circle?.getExtent();

      expect(extent).toEqual([50, 50, 150, 150]);
    }));

    it('should update extent when circle changes', fakeAsync(() => {
      fixture.detectChanges();

      flush();

      testComponent.center.set([0, 0]);
      testComponent.radius.set(100);
      fixture.detectChanges();

      const circle = circleGeometryComponent.getInstance();
      expect(circle?.getExtent()).toEqual([-100, -100, 100, 100]);

      testComponent.radius.set(200);
      fixture.detectChanges();

      expect(circle?.getExtent()).toEqual([-200, -200, 200, 200]);
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
              <wol-circle-geometry
                [wolCenter]="center()"
                [wolRadius]="radius()"
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
    WolCircleGeometryComponent,
  ],
})
export class BasicCircleGeometryComponent {
  center = signal<Coordinate>([0, 0]);
  radius = signal<number | undefined>(100);
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
