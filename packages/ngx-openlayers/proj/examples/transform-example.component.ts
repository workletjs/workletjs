import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTransformPipe } from '@workletjs/ngx-openlayers/proj';

@Component({
  selector: 'wol-transform-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolTransformPipe],
  template: `
    <div>
      <h3>Transform Pipe Example</h3>
      <p>Input: [1385835.59, 5145942.11] from 'EPSG:3857' to 'EPSG:4326'</p>
      <p>
        Output:
        {{ [1385835.59, 5145942.11] | wolTransform: 'EPSG:3857' : 'EPSG:4326' }}
      </p>
    </div>
  `,
})
export class WolTransformExampleComponent {}
