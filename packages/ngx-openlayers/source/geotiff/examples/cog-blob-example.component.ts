import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolGeoTIFFSourceModule } from '@workletjs/ngx-openlayers/source/geotiff';
import { ViewOptions } from 'ol/View';
import DataTile from 'ol/DataTile';
import ImageTile from 'ol/ImageTile';
import DataTileSource from 'ol/source/DataTile';
import GeoTIFFSource from 'ol/source/GeoTIFF';

@Component({
  selector: 'wol-cog-blob-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolWebGLTileLayerModule, WolGeoTIFFSourceModule],
  template: `
    <wol-map class="h-96" [wolView]="viewOptions()">
      <wol-webgl-tile-layer (wolSourceChange)="onSourceChange($event)">
        @if (!blobResource.isLoading()) {
          <wol-geotiff-source
            [wolSources]="[
              {
                blob: blobResource.value(),
              },
            ]"
          />
        }
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolCOGBlobExampleComponent {
  readonly blobResource = httpResource.blob(
    () => `https://openlayers.org/en/latest/examples/data/example.tif`,
  );
  readonly viewOptions = signal<Promise<ViewOptions> | undefined>(undefined);

  onSourceChange(source: DataTileSource<DataTile | ImageTile> | undefined): void {
    if (source instanceof GeoTIFFSource) {
      const viewConfig = source
        .getView()
        .then((viewConfig) => ({ ...viewConfig, showFullExtent: true }));
      this.viewOptions.set(viewConfig);
    }
  }
}
