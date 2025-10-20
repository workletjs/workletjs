import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent, WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import View from 'ol/View';

@Component({
  selector: 'wol-preload-tiles-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolTileLayerModule, WolOSMSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-4808600, -2620936]" [wolZoom]="8" />
      <wol-tile-layer [wolPreload]="Infinity">
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
    <wol-map class="h-96 mt-4" [wolView]="view()">
      <wol-tile-layer [wolPreload]="0">
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolPreloadTilesExampleComponent {
  readonly Infinity = Infinity;
  readonly viewComponent = viewChild.required(WolViewComponent);

  readonly view = signal<View | undefined>(undefined);

  constructor() {
    afterNextRender(() => {
      this.view.set(this.viewComponent().getInstance());
    });
  }
}
