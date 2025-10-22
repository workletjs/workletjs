import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTransformExtentPipe } from '@workletjs/ngx-openlayers/proj';

@Component({
  selector: 'wol-transform-extent-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolTransformExtentPipe],
  template: `
    <div>
      <h3>Transform Extent Pipe Example</h3>
      <p>Input: [1385835.59, 5145942.11, 1386835.59, 5146942.11] from 'EPSG:3857' to 'EPSG:4326'</p>
      <p>
        Output:
        {{
          [1385835.59, 5145942.11, 1386835.59, 5146942.11]
            | wolTransformExtent: 'EPSG:3857' : 'EPSG:4326'
        }}
      </p>
    </div>
  `,
})
export class WolTransformExtentExampleComponent {}
