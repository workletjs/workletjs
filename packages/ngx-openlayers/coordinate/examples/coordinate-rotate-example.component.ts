import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolCoordinateModule } from '@workletjs/ngx-openlayers/coordinate';

@Component({
  selector: 'wol-coordinate-rotate-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolCoordinateModule],
  template: `
    <p>Rotating [7.85, 47.983333] by 45 degrees results in:</p>
    <p>{{ [7.85, 47.983333] | wolRotate: angle }}</p>
  `,
})
export class WolCoordinateRotateExampleComponent {
  readonly angle = Math.PI / 2; // 90 degrees
}
