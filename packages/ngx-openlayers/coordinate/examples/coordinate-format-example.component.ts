import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolCoordinateModule } from '@workletjs/ngx-openlayers/coordinate';

@Component({
  selector: 'wol-coordinate-format-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolCoordinateModule],
  template: `
    <p>Formatting [7.85, 47.983333] with template '{{ template }}' results in:</p>
    <p>Without specifying the fractional digits: {{ [7.85, 47.983333] | wolFormat: template }}</p>
    <p>
      Explicitly specifying the fractional digits: {{ [7.85, 47.983333] | wolFormat: template : 2 }}
    </p>
  `,
})
export class WolCoordinateFormatExampleComponent {
  readonly template = 'Coordinate is ({x}|{y}).';
}
