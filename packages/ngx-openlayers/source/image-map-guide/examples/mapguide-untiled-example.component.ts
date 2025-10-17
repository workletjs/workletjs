import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageMapGuideSourceModule } from '@workletjs/ngx-openlayers/source/image-map-guide';

@Component({
  selector: 'wol-mapguide-untiled-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolImageLayerModule, WolImageMapGuideSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view
        [wolCenter]="[-87.7302542509315, 43.744459064634]"
        [wolProjection]="'EPSG:4326'"
        [wolZoom]="12"
      />
      <wol-image-layer [wolExtent]="bounds">
        <wol-image-map-guide-source
          [wolProjection]="'EPSG:4326'"
          [wolUrl]="agentUrl"
          [wolUseOverlay]="false"
          [wolMetersPerUnit]="111319.4908"
          [wolParams]="{
            MAPDEFINITION: mdf,
            FORMAT: 'PNG',
            VERSION: '3.0.0',
            USERNAME: 'OLGuest',
            PASSWORD: 'olguest',
          }"
          [wolRatio]="2"
        />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolMapGuideUntiledExampleComponent {
  readonly mdf = 'Library://Samples/Sheboygan/Maps/Sheboygan.MapDefinition';
  readonly agentUrl = 'https://mikenunn.net/mapguide/mapagent/mapagent.fcgi?';
  readonly bounds = [
    -87.865114442365922, 43.665065564837931, -87.595394059497067, 43.823852564430069,
  ];
}
