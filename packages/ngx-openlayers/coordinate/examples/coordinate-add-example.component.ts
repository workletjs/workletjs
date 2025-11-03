import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolCoordinateModule } from '@workletjs/ngx-openlayers/coordinate';

@Component({
  selector: 'wol-coordinate-add-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolCoordinateModule],
  template: `
    <p>Adding [-2, 4] to [7.85, 47.983333] results in:</p>
    <p>{{ [7.85, 47.983333] | wolAdd: [-2, 4] }}</p>
  `,
})
export class WolCoordinateAddExampleComponent {}
