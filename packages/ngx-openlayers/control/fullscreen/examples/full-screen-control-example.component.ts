import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolFullScreenControlModule } from '@workletjs/ngx-openlayers/control/fullscreen';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { defaults } from 'ol/control/defaults';

@Component({
  selector: 'wol-full-screen-control-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolFullScreenControlModule,
    WolWebGLTileLayerModule,
    WolImageTileSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolControls]="controls">
      <wol-view [wolCenter]="[-9101767, 2822912]" [wolZoom]="14" />
      <wol-fullscreen-control />
      <wol-webgl-tile-layer>
        <wol-image-tile-source
          [wolAttributions]="attributions"
          [wolUrl]="'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key"
          [wolTileSize]="512"
          [wolMaxZoom]="20"
        />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolFullScreenControlExampleComponent {
  readonly controls = defaults();

  // Get your own API key at https://www.maptiler.com/cloud/
  readonly key = '8OyphSYjlGSuAe4ZUCkV';
  readonly attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
}
