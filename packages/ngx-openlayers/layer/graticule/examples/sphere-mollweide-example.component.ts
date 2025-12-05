import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolGraticuleLayerModule } from '@workletjs/ngx-openlayers/layer/graticule';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { Projection, ProjectionLike } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import GeoJSON from 'ol/format/GeoJSON';

@Component({
  selector: 'wol-sphere-mollweide-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolGraticuleLayerModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolKeyboardEventTarget]="document">
      <wol-view [wolProjection]="sphereMollweideProjection" [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-vector-layer
        [wolStyle]="{
          'fill-color': ['string', ['get', 'COLOR_BIO'], '#eee'],
        }"
      >
        <wol-vector-source
          [wolUrl]="'https://openlayers.org/data/vector/ecoregions.json'"
          [wolFormat]="format"
        />
      </wol-vector-layer>
      <wol-graticule-layer />
    </wol-map>
  `,
})
export class WolSphereMollweideExampleComponent {
  readonly document = inject(DOCUMENT);
  readonly sphereMollweideProjection: ProjectionLike;
  readonly format = new GeoJSON();

  constructor() {
    proj4.defs(
      'ESRI:53009',
      '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 ' + '+b=6371000 +units=m +no_defs',
    );
    register(proj4);

    this.sphereMollweideProjection = new Projection({
      code: 'ESRI:53009',
      extent: [-18019909.21177587, -9009954.605703328, 18019909.21177587, 9009954.605703328],
      worldExtent: [-179, -89.99, 179, 89.99],
    });
  }
}
