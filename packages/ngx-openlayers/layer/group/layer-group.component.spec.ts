import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Collection from 'ol/Collection';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

import { WolLayerGroupComponent } from './layer-group.component';

describe('WolLayerGroupComponent', () => {
  let fixture: ComponentFixture<BasicLayerGroupComponent>;
  let testComponent: BasicLayerGroupComponent;
  let mapComponent: WolMapComponent;
  let layerGroupComponent: WolLayerGroupComponent;

  beforeEach(async () => {
    fixture = TestBed.createComponent(BasicLayerGroupComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    mapComponent = fixture.debugElement.query(By.directive(WolMapComponent)).componentInstance;
    layerGroupComponent = fixture.debugElement.query(
      By.directive(WolLayerGroupComponent),
    ).componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the layer group component within the map', () => {
      const layerGroup = layerGroupComponent.getInstance();
      const map = mapComponent.getInstance() as Map;

      expect(layerGroupComponent).toBeTruthy();
      expect(layerGroup).toBeInstanceOf(LayerGroup);
      expect(map.getLayers().getArray()).toContain(layerGroup);
    });
  });

  describe('Opacity Binding', () => {
    it('should set initial opacity from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getOpacity()).toBe(0.5);
    });

    it('should update opacity when signal changes', () => {
      testComponent.opacity.set(0.8);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getOpacity()).toBe(0.8);
    });

    it('should update signal when opacity changes programmatically', () => {
      const opacity = 0.3;
      const opacitySpy = vi.spyOn(layerGroupComponent.wolOpacity, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setOpacity(opacity);
      fixture.detectChanges();

      expect(testComponent.opacity()).toBe(opacity);
      expect(opacitySpy).toHaveBeenCalledWith(opacity);
    });

    it('should handle opacity value of 0', () => {
      testComponent.opacity.set(0);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getOpacity()).toBe(0);
    });

    it('should handle opacity value of 1', () => {
      testComponent.opacity.set(1);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getOpacity()).toBe(1);
    });
  });

  describe('Visibility Binding', () => {
    it('should set initial visibility from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getVisible()).toBe(true);
    });

    it('should update visibility when signal changes', () => {
      testComponent.visible.set(false);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getVisible()).toBe(false);
    });

    it('should update signal when visibility changes programmatically', () => {
      const visible = false;
      const visibleSpy = vi.spyOn(layerGroupComponent.wolVisible, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setVisible(visible);
      fixture.detectChanges();

      expect(testComponent.visible()).toBe(visible);
      expect(visibleSpy).toHaveBeenCalledWith(visible);
    });
  });

  describe('Extent Binding', () => {
    it('should set initial extent from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getExtent()).toEqual(undefined);
    });

    it('should update extent when signal changes', () => {
      const extent: Extent = [0, 0, 100, 100];
      testComponent.extent.set(extent);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getExtent()).toEqual(extent);
    });

    it('should update signal when extent changes programmatically', () => {
      const extent: Extent = [10, 20, 30, 40];
      const extentSpy = vi.spyOn(layerGroupComponent.wolExtent, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setExtent(extent);
      fixture.detectChanges();

      expect(testComponent.extent()).toEqual(extent);
      expect(extentSpy).toHaveBeenCalledWith(extent);
    });
  });

  describe('Z-Index Binding', () => {
    it('should set initial zIndex from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getZIndex()).toBe(0);
    });

    it('should update zIndex when signal changes', () => {
      testComponent.zIndex.set(10);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getZIndex()).toBe(10);
    });

    it('should update signal when zIndex changes programmatically', () => {
      const zIndex = 5;
      const zIndexSpy = vi.spyOn(layerGroupComponent.wolZIndex, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setZIndex(zIndex);
      fixture.detectChanges();

      expect(testComponent.zIndex()).toBe(zIndex);
      expect(zIndexSpy).toHaveBeenCalledWith(zIndex);
    });

    it('should handle negative zIndex values', () => {
      testComponent.zIndex.set(-1);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getZIndex()).toBe(-1);
    });
  });

  describe('MinResolution Binding', () => {
    it('should set initial minResolution from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMinResolution()).toBe(0);
    });

    it('should update minResolution when signal changes', () => {
      testComponent.minResolution.set(15);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMinResolution()).toBe(15);
    });

    it('should update signal when minResolution changes programmatically', () => {
      const minResolution = 20;
      const minResolutionSpy = vi.spyOn(layerGroupComponent.wolMinResolution, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setMinResolution(minResolution);
      fixture.detectChanges();

      expect(testComponent.minResolution()).toBe(minResolution);
      expect(minResolutionSpy).toHaveBeenCalledWith(minResolution);
    });
  });

  describe('MaxResolution Binding', () => {
    it('should set initial maxResolution from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMaxResolution()).toBe(Infinity);
    });

    it('should update maxResolution when signal changes', () => {
      testComponent.maxResolution.set(500);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMaxResolution()).toBe(500);
    });

    it('should update signal when maxResolution changes programmatically', () => {
      const maxResolution = 300;
      const maxResolutionSpy = vi.spyOn(layerGroupComponent.wolMaxResolution, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setMaxResolution(maxResolution);
      fixture.detectChanges();

      expect(testComponent.maxResolution()).toBe(maxResolution);
      expect(maxResolutionSpy).toHaveBeenCalledWith(maxResolution);
    });
  });

  describe('MinZoom Binding', () => {
    it('should set initial minZoom from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMinZoom()).toBe(0);
    });

    it('should update minZoom when signal changes', () => {
      testComponent.minZoom.set(3);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMinZoom()).toBe(3);
    });

    it('should update signal when minZoom changes programmatically', () => {
      const minZoom = 4;
      const minZoomSpy = vi.spyOn(layerGroupComponent.wolMinZoom, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setMinZoom(minZoom);
      fixture.detectChanges();

      expect(testComponent.minZoom()).toBe(minZoom);
      expect(minZoomSpy).toHaveBeenCalledWith(minZoom);
    });
  });

  describe('MaxZoom Binding', () => {
    it('should set initial maxZoom from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMaxZoom()).toBe(28);
    });

    it('should update maxZoom when signal changes', () => {
      testComponent.maxZoom.set(20);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMaxZoom()).toBe(20);
    });

    it('should update signal when maxZoom changes programmatically', () => {
      const maxZoom = 25;
      const maxZoomSpy = vi.spyOn(layerGroupComponent.wolMaxZoom, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setMaxZoom(maxZoom);
      fixture.detectChanges();

      expect(testComponent.maxZoom()).toBe(maxZoom);
      expect(maxZoomSpy).toHaveBeenCalledWith(maxZoom);
    });

    it('should handle Infinity maxZoom value', () => {
      testComponent.maxZoom.set(Infinity);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getMaxZoom()).toBe(Infinity);
    });
  });

  describe('Layers Binding', () => {
    it('should set initial layers from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getLayers().getLength()).toBe(0);
    });

    it('should set array of layers initially', () => {
      const layers = [new TileLayer({ source: new OSM() })];
      testComponent.layers.set(layers);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getLayers().getLength()).toBe(1);
      expect(layerGroup?.getLayers().item(0)).toBe(layers[0]);
    });

    it('should set Collection of layers initially', () => {
      const layers = new Collection([new TileLayer({ source: new OSM() })]);
      testComponent.layers.set(layers);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getLayers()).toBe(layers);
    });

    it('should update layers when signal changes to empty array', () => {
      const layers = [new TileLayer({ source: new OSM() })];
      testComponent.layers.set(layers);
      fixture.detectChanges();

      testComponent.layers.set([]);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getLayers().getLength()).toBe(0);
    });

    it('should update layers when signal changes to undefined', () => {
      const layers = [new TileLayer({ source: new OSM() })];
      testComponent.layers.set(layers);
      fixture.detectChanges();

      testComponent.layers.set(undefined);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getLayers().getLength()).toBe(0);
    });

    it('should update layers when signal changes to Collection', () => {
      const layersArray = [new TileLayer({ source: new OSM() })];
      testComponent.layers.set(layersArray);
      fixture.detectChanges();

      const layersCollection = new Collection([new TileLayer({ source: new OSM() })]);
      testComponent.layers.set(layersCollection);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getLayers()).toBe(layersCollection);
      expect(layerGroup?.getLayers().getLength()).toBe(1);
      expect(layerGroup?.getLayers().item(0)).toBe(layersCollection.item(0));
    });

    it('should update signal when layers change programmatically', () => {
      const layers = new Collection([new TileLayer({ source: new OSM() })]);
      const layersSpy = vi.spyOn(layerGroupComponent.wolLayers, 'set');
      const layerGroup = layerGroupComponent.getInstance();
      layerGroup?.setLayers(layers);
      fixture.detectChanges();

      expect(testComponent.layers()).toBe(layers);
      expect(layersSpy).toHaveBeenCalledWith(layers);
    });
  });

  describe('Properties Binding', () => {
    it('should set initial properties from signal', () => {
      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.get('customProp')).toBeUndefined();
    });

    it('should set properties when signal changes', () => {
      const properties: WolProperties = { customProp: 'value', id: 42 };
      testComponent.properties.set(properties);
      fixture.detectChanges();

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.get('customProp')).toBe('value');
      expect(layerGroup?.get('id')).toBe(42);
    });
  });

  describe('Output Events', () => {
    it('should emit change event', () => {
      const emitSpy = vi.spyOn(layerGroupComponent.wolChange, 'emit');
      const layerGroup = layerGroupComponent.getInstance();
      const changeEvent = new BaseEvent('change');

      layerGroup?.dispatchEvent(changeEvent);

      expect(emitSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit error event', () => {
      const emitSpy = vi.spyOn(layerGroupComponent.wolError, 'emit');
      const layerGroup = layerGroupComponent.getInstance();
      const errorEvent = new BaseEvent('error');

      layerGroup?.dispatchEvent(errorEvent);

      expect(emitSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit propertychange event', () => {
      const emitSpy = vi.spyOn(layerGroupComponent.wolPropertyChange, 'emit');
      const layerGroup = layerGroupComponent.getInstance();
      const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 'testValue');

      layerGroup?.dispatchEvent(propertyChangeEvent);

      expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
    });
  });

  describe('getInstance', () => {
    it('should return LayerGroup instance after initialization', () => {
      const instance = layerGroupComponent.getInstance();
      expect(instance).toBeInstanceOf(LayerGroup);
    });
  });

  describe('destroy lifecycle', () => {
    it('should remove layer from map on destroy', () => {
      const layerGroup = layerGroupComponent.getInstance();
      const map = mapComponent.getInstance() as Map;

      testComponent.enabled.set(false);
      fixture.detectChanges();

      expect(map.getLayers().getArray()).not.toContain(layerGroup);
    });

    it('should set instance to undefined on destroy', () => {
      expect(layerGroupComponent.getInstance()).toBeDefined();

      fixture.destroy();

      expect(layerGroupComponent.getInstance()).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid input changes', () => {
      for (let i = 0; i < 10; i++) {
        testComponent.opacity.set(i / 10);
        fixture.detectChanges();
      }

      const layerGroup = layerGroupComponent.getInstance();
      expect(layerGroup?.getOpacity()).toBe(0.9);
    });
  });
});

@Component({
  template: `
    <wol-map>
      @if (enabled()) {
        <wol-layer-group
          [(wolOpacity)]="opacity"
          [(wolVisible)]="visible"
          [(wolExtent)]="extent"
          [(wolZIndex)]="zIndex"
          [(wolMinResolution)]="minResolution"
          [(wolMaxResolution)]="maxResolution"
          [(wolMinZoom)]="minZoom"
          [(wolMaxZoom)]="maxZoom"
          [(wolLayers)]="layers"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  imports: [WolMapComponent, WolLayerGroupComponent],
})
export class BasicLayerGroupComponent {
  opacity = signal<number | undefined>(0.5);
  visible = signal<boolean | undefined>(true);
  extent = signal<Extent | undefined>(undefined);
  zIndex = signal(0);
  minResolution = signal(0);
  maxResolution = signal(Infinity);
  minZoom = signal(0);
  maxZoom = signal(28);
  layers = signal<BaseLayer[] | Collection<BaseLayer> | undefined>([]);
  properties = signal<WolProperties | undefined>(undefined);
  enabled = signal(true);
}
