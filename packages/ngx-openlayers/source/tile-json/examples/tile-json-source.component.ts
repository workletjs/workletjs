import { Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolTileJSONSourceModule } from '@workletjs/ngx-openlayers/source/tile-json';

@Component({
  selector: 'wol-tile-json-source-example',
  imports: [WolMapModule, WolViewModule, WolTileLayerModule, WolTileJSONSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-tile-layer>
        <wol-tile-json-source
          wolUrl="https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad?f=tilejson"
          wolCrossOrigin="anonymous"
        />
      </wol-tile-layer>
    </wol-map>
  `,
  styles: ``,
})
export class WolTileJSONSourceExampleComponent {}
