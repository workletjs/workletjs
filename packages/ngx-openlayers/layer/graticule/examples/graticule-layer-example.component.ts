import { ChangeDetectionStrategy, Component } from '@angular/core';

import Stroke from 'ol/style/Stroke';

import { WolGraticuleLayerModule } from '@workletjs/ngx-openlayers/layer/graticule';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-graticule-layer-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolGraticuleLayerModule,
    WolTileLayerModule,
    WolProjModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[4.8, 47.75] | wolFromLonLat" [wolZoom]="5" />
      <wol-tile-layer>
        <wol-osm-source [wolWrapX]="false" />
      </wol-tile-layer>
      <wol-graticule-layer
        [wolStrokeStyle]="strokeStyle"
        [wolShowLabels]="true"
        [wolWrapX]="false"
      />
    </wol-map>
  `,
})
export class WolGraticuleLayerExampleComponent {
  readonly strokeStyle = new Stroke({
    color: 'rgba(255,120,0,0.9)',
    width: 2,
    lineDash: [0.5, 4],
  });
}
