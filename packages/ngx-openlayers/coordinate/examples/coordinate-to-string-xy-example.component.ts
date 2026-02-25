import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WolCoordinateModule } from '@workletjs/ngx-openlayers/coordinate';

@Component({
  selector: 'wol-coordinate-to-string-xy-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolCoordinateModule],
  template: `
    <p>Converting {{ coordinate }} to XY string format results in:</p>
    <p>Without specifying fractional digits: {{ coordinate | wolToStringXY }}</p>
    <p>Explicitly specifying 1 fractional digits: {{ coordinate | wolToStringXY: 1 }}</p>
  `,
})
export class WolCoordinateToStringXYExampleComponent {
  readonly coordinate = [7.85, 47.983333];
}
