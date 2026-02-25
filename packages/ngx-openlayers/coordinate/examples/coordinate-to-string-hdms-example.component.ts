import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WolCoordinateModule } from '@workletjs/ngx-openlayers/coordinate';

@Component({
  selector: 'wol-coordinate-to-string-hdms-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolCoordinateModule],
  template: `
    <p>Converting {{ coordinate }} to HDMS format results in:</p>
    <p>Without specifying fractional digits: {{ coordinate | wolToStringHDMS }}</p>
    <p>Explicitly specifying 1 fractional digit: {{ coordinate | wolToStringHDMS: 1 }}</p>
  `,
})
export class WolCoordinateToStringHDMSExampleComponent {
  readonly coordinate = [7.85, 47.983333];
}
