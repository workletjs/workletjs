import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';

@Component({
  selector: 'wol-image-tile-xyz-esri-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolProjModule,
    WolWebGLTileLayerModule,
    WolImageTileSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-121.1, 47.5] | wolFromLonLat" [wolZoom]="7" />
      <wol-webgl-tile-layer>
        <wol-image-tile-source [wolAttributions]="attributions" [wolUrl]="url" />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolImageTileXYZEsriExampleComponent {
  readonly attributions =
    'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>';
  readonly url =
    'https://server.arcgisonline.com/ArcGIS/rest/services/' +
    'World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
}
