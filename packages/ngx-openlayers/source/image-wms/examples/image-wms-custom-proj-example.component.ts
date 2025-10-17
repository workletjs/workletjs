import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageWMSSourceModule } from '@workletjs/ngx-openlayers/source/image-wms';
import { WolScaleLineControlModule } from '@workletjs/ngx-openlayers/control/scale-line';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { Projection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

@Component({
  selector: 'wol-image-wms-custom-proj-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolImageLayerModule,
    WolImageWMSSourceModule,
    WolScaleLineControlModule,
    WolProjModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view
        [wolProjection]="projection"
        [wolCenter]="[8.23, 46.86] | wolFromLonLat: projection"
        [wolExtent]="extent"
        [wolZoom]="2"
      />
      <wol-scale-line-control />
      <wol-image-layer [wolExtent]="extent">
        <wol-image-wms-source
          [wolUrl]="'https://wms.geo.admin.ch/'"
          [wolCrossOrigin]="'anonymous'"
          [wolAttributions]="swisstopoAttributions"
          [wolParams]="{
            LAYERS: 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
            FORMAT: 'image/jpeg',
          }"
          [wolServerType]="'mapserver'"
        />
      </wol-image-layer>
      <wol-image-layer [wolExtent]="extent">
        <wol-image-wms-source
          [wolUrl]="'https://wms.geo.admin.ch/'"
          [wolCrossOrigin]="'anonymous'"
          [wolAttributions]="hydrodatenAttributions"
          [wolParams]="{ LAYERS: 'ch.bafu.hydroweb-warnkarte_national' }"
          [wolServerType]="'mapserver'"
        />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolImageWMSCustomProjExampleComponent {
  readonly projection = new Projection({
    code: 'EPSG:21781',
    extent: [485869.5728, 76443.1884, 837076.5648, 299941.7864],
  });

  readonly extent = [420000, 30000, 900000, 350000];

  readonly swisstopoAttributions =
    '© <a href="https://shop.swisstopo.admin.ch/en/products/maps/national/lk1000" ' +
    'target="_blank">Pixelmap 1:1000000 / geo.admin.ch</a>';

  readonly hydrodatenAttributions =
    '© <a href="https://www.hydrodaten.admin.ch/en/notes-on-the-flood-alert-maps.html" ' +
    'target="_blank">Flood Alert / geo.admin.ch</a>';

  constructor() {
    // Transparent Proj4js support:
    //
    // EPSG:21781 is known to Proj4js because its definition is registered by
    // calling proj4.defs(). Now when we create an ol/proj/Projection instance with
    // the 'EPSG:21781' code, OpenLayers will pick up the transform functions from
    // Proj4js. To get the registered ol/proj/Projection instance with other
    // parameters like units and axis orientation applied from Proj4js, use
    // `ol/proj#get('EPSG:21781')`.
    //
    // Note that we are setting the projection's extent here, which is used to
    // determine the view resolution for zoom level 0. Recommended values for a
    // projection's validity extent can be found at https://epsg.io/.

    proj4.defs(
      'EPSG:21781',
      '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
        '+x_0=600000 +y_0=200000 +ellps=bessel ' +
        '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs',
    );
    register(proj4);
  }
}
