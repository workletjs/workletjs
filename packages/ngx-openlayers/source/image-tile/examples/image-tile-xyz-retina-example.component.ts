import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';

@Component({
  selector: 'wol-image-tile-xyz-retina-example',
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
      <wol-view
        [wolCenter]="[-112.21324137318899, 36.105337765976756] | wolFromLonLat"
        [wolZoom]="13"
      />
      <wol-webgl-tile-layer>
        <wol-image-tile-source
          [wolAttributions]="attributions"
          [wolUrl]="'https://api.maptiler.com/maps/outdoor-v2/256/{z}/{x}/{y}@2x.png?key=' + key"
        />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolImageTileXYZRetinaExampleComponent {
  // Get your own API key at https://www.maptiler.com/cloud/
  readonly key = '8OyphSYjlGSuAe4ZUCkV';
  readonly attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
}
