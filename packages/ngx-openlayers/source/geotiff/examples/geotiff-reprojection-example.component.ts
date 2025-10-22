import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent, WolViewModule } from '@workletjs/ngx-openlayers/view';
import {
  WolGeoTIFFSourceComponent,
  WolGeoTIFFSourceModule,
} from '@workletjs/ngx-openlayers/source/geotiff';
import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';

@Component({
  selector: 'app-geotiff-reprojection-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolWebGLTileLayerModule, WolGeoTIFFSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="center()" [wolZoom]="12" />
      <wol-webgl-tile-layer>
        <wol-geotiff-source
          [wolSources]="[
            {
              url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif',
            },
          ]"
        />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolGeoTIFFReprojectionExampleComponent {
  readonly center = signal<Coordinate>([0, 0]);
  readonly viewRef = viewChild.required(WolViewComponent);
  readonly geotiffRef = viewChild.required(WolGeoTIFFSourceComponent);

  constructor() {
    afterNextRender(() => {
      const view = this.viewRef().getInstance();
      const geotiff = this.geotiffRef().getInstance();

      if (!view || !geotiff) {
        return;
      }

      // after GeoTIFF metadata has been read, recenter the map to show the image
      geotiff?.getView().then((sourceView) => {
        // transform the image center to view coorindates
        const center = transform(
          sourceView.center as Coordinate,
          sourceView.projection,
          view.getProjection(),
        );

        // update the view to show the image
        this.center.set(center);
      });
    });
  }
}
