import { Component, signal, viewChild } from '@angular/core';

import MapBrowserEvent from 'ol/MapBrowserEvent';

import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceComponent } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'app-component-usage-example',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolOSMSourceComponent],
  template: `
    <button type="button" (click)="zoom.set(zoom() + 1)">Zoom in</button>
    <button type="button" (click)="resetView()">Animate to start</button>
    <p>Zoom: {{ zoom() }}</p>
    <p>Last click: {{ lastClick() }}</p>
    <wol-map tabindex="0" (wolSingleClick)="onSingleClick($event)">
      <wol-view [wolCenter]="[0, 0]" [(wolZoom)]="zoom" />
      <wol-tile-layer><wol-osm-source /></wol-tile-layer>
    </wol-map>
  `,
  styles: `
    wol-map {
      height: 400px;
    }
  `,
})
export class ComponentUsageExampleComponent {
  readonly zoom = signal(2);
  readonly lastClick = signal('Click the map to inspect a coordinate.');
  readonly view = viewChild(WolViewComponent);

  onSingleClick(event: MapBrowserEvent<PointerEvent>): void {
    this.lastClick.set(event.coordinate.join(', '));
  }

  resetView(): void {
    const instance = this.view()?.getInstance();
    if (!instance) return;
    instance.animate({ center: [0, 0], zoom: 2, duration: 500 });
  }
}
