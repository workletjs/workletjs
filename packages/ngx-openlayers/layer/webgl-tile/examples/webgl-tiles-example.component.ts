import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';

@Component({
  selector: 'wol-webgl-tiles-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolWebGLTileLayerModule, WolImageTileSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="0" />
      <wol-webgl-tile-layer>
        <wol-image-tile-source [wolUrl]="url" [wolAttributions]="attributions" />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolWebGLTilesExampleComponent {
  readonly url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  readonly attributions =
    '&#169; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.';
}
