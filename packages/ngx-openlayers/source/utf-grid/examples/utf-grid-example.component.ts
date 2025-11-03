import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOverlayModule } from '@workletjs/ngx-openlayers/overlay';
import { WolTileJSONSourceModule } from '@workletjs/ngx-openlayers/source/tile-json';
import {
  WolUTFGridSourceComponent,
  WolUTFGridSourceModule,
} from '@workletjs/ngx-openlayers/source/utf-grid';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { Coordinate } from 'ol/coordinate';

@Component({
  selector: 'wol-utf-grid-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolOverlayModule,
    WolTileLayerModule,
    WolTileJSONSourceModule,
    WolUTFGridSourceModule,
  ],
  template: `
    <wol-map class="h-96" (wolPointerMove)="onPointerMove($event)" (wolClick)="onClick($event)">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-tile-layer>
        <wol-tile-json-source
          [wolUrl]="
            'https://api.tiles.mapbox.com/v4/mapbox.geography-class.json?secure&access_token=' + key
          "
        />
      </wol-tile-layer>
      <wol-tile-layer>
        <wol-utf-grid-source
          [wolUrl]="
            'https://api.tiles.mapbox.com/v4/mapbox.geography-class.json?secure&access_token=' + key
          "
        />
      </wol-tile-layer>
      @if (countryInfo(); as data) {
        <wol-overlay
          [wolPosition]="data.coordinate"
          [wolOffset]="[15, 15]"
          [wolStopEvent]="false"
          [wolClassName]="'abc'"
        >
          <div class="text-black text-[12pt] font-bold text-shadow-white text-shadow-md">{{ data.name }}</div>
          <img [src]="data.flag" />
        </wol-overlay>
      }
    </wol-map>
  `,
})
export class WolUTFGridExampleComponent {
  // Your Mapbox access token from https://mapbox.com/ here
  readonly key = `pk.eyJ1Ijoiam9ubnl0b3NoZW4iLCJhIjoiY21nazlrbXh2MG8xYjJscXcwbnVxdjVsZCJ9.znL9YlBqCSrootZ2EqRM2w`;
  readonly countryInfo = signal<{ flag: string; name: string; coordinate: Coordinate } | null>(
    null,
  );

  readonly renderer = inject(Renderer2);
  readonly mapComponent = viewChild.required(WolMapComponent);
  readonly gridSourceComponent = viewChild.required(WolUTFGridSourceComponent);

  displayCountryInfo(coordinate: Coordinate): void {
    const map = this.mapComponent().getInstance();
    const viewResolution = map?.getView().getResolution();
    const gridSource = this.gridSourceComponent().getInstance();

    if (!map || !gridSource || !viewResolution) {
      return;
    }

    gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution, (data) => {
      // If you want to use the template from the TileJSON,
      // load the mustache.js library separately and call
      // info.innerHTML = Mustache.render(gridSource.getTemplate(), data);

      this.renderer.setStyle(map.getTargetElement(), 'cursor', data ? 'pointer' : '');

      if (data) {
        this.countryInfo.set({
          flag: 'data:image/png;base64,' + data['flag_png'],
          name: data['admin'],
          coordinate: coordinate,
        });
      } else {
        this.countryInfo.set(null);
      }
    });
  }

  onPointerMove(event: MapBrowserEvent<PointerEvent>): void {
    const map = this.mapComponent().getInstance();

    if (event.dragging || !map) {
      return;
    }

    const coordinate = map.getEventCoordinate(event.originalEvent);

    this.displayCountryInfo(coordinate);
  }

  onClick(event: MapBrowserEvent<PointerEvent>): void {
    this.displayCountryInfo(event.coordinate);
  }
}
