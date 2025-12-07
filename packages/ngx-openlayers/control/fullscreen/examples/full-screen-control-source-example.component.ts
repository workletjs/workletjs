import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolFullScreenControlModule } from '@workletjs/ngx-openlayers/control/fullscreen';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { defaults } from 'ol/control/defaults';

@Component({
  selector: 'wol-full-screen-control-source-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolFullScreenControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <div #fullscreen class="flex h-96">
      <wol-map class="h-full flex-auto" [wolControls]="controls">
        <wol-view [wolCenter]="[-9101767, 2822912]" [wolZoom]="12" />
        <wol-fullscreen-control [wolSource]="fullscreen" />
        <wol-tile-layer>
          <wol-osm-source />
        </wol-tile-layer>
      </wol-map>
      <div class="flex w-1/5 items-center justify-center bg-teal-600">
        <span class="text-center text-5xl text-white">Side Panel</span>
      </div>
    </div>
  `,
})
export class WolFullScreenControlSourceExampleComponent {
  readonly controls = defaults();
}
