import { Component } from '@angular/core';
import { WolToLonLatPipe } from '@workletjs/ngx-openlayers/proj';

@Component({
  selector: 'wol-to-lon-lat-pipe-example',
  imports: [WolToLonLatPipe],
  template: `
    <div>
      <h3>To Lon Lat Pipe Example</h3>
      <p>Input: [1385835.59, 5145942.11]</p>
      <p>Output: {{ [1385835.59, 5145942.11] | wolToLonLat: 'EPSG:3857' }}</p>
    </div>
  `,
})
export class WolToLonLatPipeExampleComponent {}
