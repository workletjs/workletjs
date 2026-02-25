import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Coordinate } from 'ol/coordinate';

import { WolCoordinateModule } from '@workletjs/ngx-openlayers/coordinate';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOverlayModule } from '@workletjs/ngx-openlayers/overlay';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-popup-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolOverlayModule,
    WolViewModule,
    WolTileLayerModule,
    WolImageTileSourceModule,
    WolProjModule,
    WolCoordinateModule,
  ],
  template: `
    <wol-map class="h-96" (wolSingleClick)="onSingleClick($event)">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-image-tile-source
          [wolAttributions]="attributions"
          [wolUrl]="'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key"
          [wolTileSize]="512"
        />
      </wol-tile-layer>
      @if (position(); as pos) {
        <!-- Create an overlay to anchor the popup to the map. -->
        <wol-overlay
          [wolPosition]="pos"
          [wolAutoPan]="{
            animation: {
              duration: 250,
            },
          }"
        >
          <div
            class="absolute bottom-3 -left-12.5 min-w-70 rounded-lg border border-neutral-300 bg-white p-4 shadow-lg"
          >
            <div class="absolute top-full left-12 h-5 w-5 -translate-x-1/2">
              <span
                class="absolute bottom-0 border-10 border-transparent border-t-neutral-300"
              ></span>
              <span class="absolute bottom-px border-10 border-transparent border-t-white"></span>
            </div>
            <a
              class="absolute top-0.5 right-2 cursor-pointer text-blue-500 no-underline hover:focus:underline"
              (click)="onClickCloser()"
              >✖</a
            >
            <div>
              <p class="mb-4">You clicked here:</p>
              <code class="rounded-sm bg-neutral-100 px-1 py-0.5 text-sm">{{
                pos | wolToLonLat | wolToStringHDMS
              }}</code>
            </div>
          </div>
        </wol-overlay>
      }
    </wol-map>
  `,
})
export class WolPopupExampleComponent {
  // Get your own API key at https://www.maptiler.com/cloud/
  readonly key = '8OyphSYjlGSuAe4ZUCkV';
  readonly attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  readonly position = signal<Coordinate | null>(null);

  /**
   * Add a click handler to the map to render the popup.
   */
  onSingleClick(event: MapBrowserEvent<PointerEvent>): void {
    this.position.set(event.coordinate);
  }

  onClickCloser(): void {
    this.position.set(null);
  }
}
