import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';

@Component({
  selector: 'wol-image-tile-xyz-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolTileLayerModule, WolImageTileSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-472202, 7530279]" [wolZoom]="12" />
      <wol-tile-layer>
        <wol-image-tile-source
          [wolUrl]="'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=' + apiKey"
        />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolImageTileXYZExampleComponent {
  // Your API key from https://www.thunderforest.com/docs/apikeys/ here
  readonly apiKey = '0e6fc415256d4fbb9b5166a718591d71';
}
