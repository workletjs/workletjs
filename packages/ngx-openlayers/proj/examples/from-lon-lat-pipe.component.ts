import { Component } from '@angular/core';
import { WolFromLonLatPipe } from '@workletjs/ngx-openlayers/proj';

@Component({
  selector: 'wol-from-lon-lat-pipe-example',
  imports: [WolFromLonLatPipe],
  template: `
    <div>
      <h3>From Lon Lat Pipe Example</h3>
      <p>Input: [12.4924, 41.8902]</p>
      <p>Output: {{ [12.4924, 41.8902] | wolFromLonLat: 'EPSG:3857' }}</p>
    </div>
  `,
})
export class WolFromLonLatPipeExampleComponent {}
