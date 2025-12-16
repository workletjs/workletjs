import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolDrawInteractionModule } from '@workletjs/ngx-openlayers/interaction/draw';
import { WolModifyInteractionModule } from '@workletjs/ngx-openlayers/interaction/modify';
import { WolSnapInteractionModule } from '@workletjs/ngx-openlayers/interaction/snap';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { Segment, Segmenters } from 'ol/interaction/Snap';

@Component({
  selector: 'wol-snap-custom-segmenter-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolDrawInteractionModule,
    WolModifyInteractionModule,
    WolSnapInteractionModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolZoom]="4" [wolCenter]="[-11000000, 4600000]" />
      <wol-vector-layer
        wolBackground="#333"
        [wolStyle]="{
          'stroke-color': '#ffcc33',
        }"
      >
        <wol-vector-source #vectorSourceRef />
      </wol-vector-layer>

      @if (vectorSourceRef.getInstance(); as vectorSource) {
        <wol-modify-interaction [wolSource]="vectorSource" />
        <wol-draw-interaction [wolSource]="vectorSource" [wolType]="'LineString'" />
        <wol-snap-interaction [wolSource]="vectorSource" [wolSegmenters]="segmenters" />
      }
    </wol-map>
  `,
})
export class WolSnapCustomSegmenterExampleComponent {
  readonly segmenters: Segmenters = {
    LineString: (geometry) => {
      const segments: Segment[] = [];
      geometry.forEachSegment((c1, c2) => {
        segments.push([c1, c2], [[(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2]]);
      });
      return segments;
    },
  };
}
