import { Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolImageArcGISResetSourceModule } from '@workletjs/ngx-openlayers/source/image-arcgis-reset';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';

@Component({
  selector: 'wol-arcgis-image-example',
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolImageLayerModule,
    WolImageArcGISResetSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-10997148, 4569099]" [wolZoom]="4" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-image-layer>
        <wol-image-arcgis-reset-source [wolUrl]="url" [wolParams]="{}" [wolRatio]="1" />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolArcGISImageExampleComponent {
  readonly url = 'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer';
}
