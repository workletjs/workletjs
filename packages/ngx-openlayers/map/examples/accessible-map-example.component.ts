import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';

@Component({
  selector: 'wol-accessible-map-example',
  imports: [
    RouterLink,
    MatButton,
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <a class="skiplink" routerLink="./" fragment="accessible-map-fragment">Go to map</a>
    <wol-map
      tabindex="0"
      id="accessible-map-fragment"
      class="h-96 m-0.5 focus:outline focus:outline-2 outline-blue-700"
    >
      <wol-view [wolCenter]="[0, 0]" [(wolZoom)]="zoom" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
    <div class="mt-4 flex gap-2">
      <button matButton="tonal" (click)="zoomOut()">Zoom out</button>
      <button matButton="tonal" (click)="zoomIn()">Zoom in</button>
    </div>
  `,
  styles: `
    :host .skiplink {
      position: absolute;
      clip: rect(1px, 1px, 1px, 1px);
      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;
    }

    :host .skiplink:focus {
      clip: auto;
      height: auto;
      width: auto;
      background-color: #fff;
      padding: 0.3em;
    }
  `,
})
export class WolAccessibleMapExampleComponent {
  readonly zoom = signal(2);

  zoomIn(): void {
    this.zoom.update((z) => z + 1);
  }

  zoomOut(): void {
    this.zoom.update((z) => z - 1);
  }
}
