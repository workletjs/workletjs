import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { WolImageLayerComponent, WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import {
  WolImageWMSSourceComponent,
  WolImageWMSSourceModule,
} from '@workletjs/ngx-openlayers/source/image-wms';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'wol-image-wms-getfeatureinfo-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolImageLayerModule, WolImageWMSSourceModule],
  template: `
    <wol-map
      class="h-96"
      [style.cursor]="cursorStyle()"
      (wolSingleClick)="onClick($event)"
      (wolPointerMove)="onPointerMove($event)"
    >
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-image-layer>
        <wol-image-wms-source
          [wolUrl]="'https://ahocevar.com/geoserver/wms'"
          [wolParams]="{ LAYERS: 'ne:ne' }"
          [wolServerType]="'geoserver'"
          [wolCrossOrigin]="'anonymous'"
        />
      </wol-image-layer>
    </wol-map>
    <div class="overflow-x-auto" [innerHTML]="resource.value()"></div>
  `,
})
export class WolImageWMSGetFeatureInfoExampleComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly wmsLayerRef = viewChild.required(WolImageLayerComponent);
  readonly wmsSourceRef = viewChild.required(WolImageWMSSourceComponent);

  readonly cursorStyle = signal('');
  readonly url = signal<string | undefined>(undefined);
  readonly resource = httpResource.text(() => this.url(), {
    parse: (value) => this.sanitizer.bypassSecurityTrustHtml(value),
  });

  onClick(event: MapBrowserEvent<PointerEvent>): void {
    const wmsSource = this.wmsSourceRef().getInstance();

    if (!wmsSource) {
      return;
    }

    const viewResolution = event.map.getView().getResolution() as number;
    const url = wmsSource.getFeatureInfoUrl(event.coordinate, viewResolution, 'EPSG:3857', {
      INFO_FORMAT: 'text/html',
    });

    if (url) {
      this.url.set(url);
    }
  }

  onPointerMove(event: MapBrowserEvent<PointerEvent>): void {
    const wmsLayer = this.wmsLayerRef().getInstance();

    if (event.dragging || !wmsLayer) {
      return;
    }
    const data = wmsLayer.getData(event.pixel) as Uint8ClampedArray | null;
    const hit = data && data[3] > 0; // transparent pixels have zero for data[3]
    this.cursorStyle.set(hit ? 'pointer' : '');
  }
}
