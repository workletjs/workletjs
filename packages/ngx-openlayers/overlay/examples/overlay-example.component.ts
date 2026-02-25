import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Coordinate } from 'ol/coordinate';

import { WolCoordinateModule } from '@workletjs/ngx-openlayers/coordinate';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOverlayModule } from '@workletjs/ngx-openlayers/overlay';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-overlay-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolOverlayModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolProjModule,
    WolCoordinateModule,
  ],
  template: `
    <wol-map class="h-96" (wolClick)="onClickMap($event)">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <!-- Vienna marker -->
      <wol-overlay
        [wolPosition]="viennaPos | wolFromLonLat"
        [wolPositioning]="'center-center'"
        [wolStopEvent]="false"
      >
        <div class="h-5 w-5 rounded-full border border-cyan-500 bg-cyan-300 opacity-50"></div>
      </wol-overlay>
      <!-- Vienna label -->
      <wol-overlay [wolPosition]="viennaPos | wolFromLonLat">
        <!-- Clickable label for Vienna -->
        <a
          class="text-[11pt] font-bold text-white no-underline text-shadow-black text-shadow-sm"
          target="_blank"
          href="https://en.wikipedia.org/wiki/Vienna"
          >Vienna</a
        >
      </wol-overlay>
      <!-- Popup showing the position the user clicked -->
      @if (clickedPos(); as pos) {
        <wol-overlay [wolPosition]="pos" [wolPositioning]="'bottom-center'">
          <div class="pb-2">
            <div class="relative max-w-64 rounded-lg border border-neutral-300 bg-white">
              <div class="absolute -bottom-4 left-1/2 h-2 w-4 -translate-x-1/2">
                <span
                  class="absolute bottom-0 border-8 border-transparent border-t-neutral-300"
                ></span>
                <span class="absolute bottom-px border-8 border-transparent border-t-white"></span>
              </div>
              <h3
                class="rounded-t-lg border-b border-b-neutral-300 bg-neutral-100 px-4 py-2 text-base"
              >
                Welcome to OpenLayers
              </h3>
              <div class="p-4 text-neutral-800">
                <p class="mb-4">The location you clicked was:</p>
                <code class="rounded-sm bg-neutral-100 px-1 py-0.5 text-sm">{{
                  pos | wolToLonLat | wolToStringHDMS
                }}</code>
              </div>
            </div>
          </div>
        </wol-overlay>
      }
    </wol-map>
  `,
})
export class WolOverlayExampleComponent {
  readonly viennaPos = [16.3725, 48.208889];
  readonly clickedPos = signal<Coordinate | null>(null);

  onClickMap(event: MapBrowserEvent<PointerEvent>): void {
    this.clickedPos.set(event.coordinate);
  }
}
