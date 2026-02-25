import { Pipe, PipeTransform } from '@angular/core';

import { Coordinate, rotate } from 'ol/coordinate';

import { isNil } from '@workletjs/ngx-openlayers/core/utils';

/**
 * Angular pipe that rotate `coordinate` by angle. `coordinate` is modified in place and returned by the function.
 * When the input is null or undefined, the pipe returns null for safe binding.
 *
 * Pipe name: `wolRotate`.
 *
 * Example usage:
 * ```html
 * <p>{{ [7.85, 47.983333] | wolRotate:Math.PI / 2 }}</p>
 * // coord is now [-47.983333, 7.85]
 * ```
 *
 * @remarks
 * - The input coordinate order is [longitude, latitude] in decimal degrees.
 * - The angle is in radians and positive values rotate counter-clockwise.
 * - This pipe is intended for template usage; prefer direct calls to `rotate` in component logic when appropriate.
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#.rotate
 */
@Pipe({
  name: 'wolRotate',
})
export class WolRotatePipe implements PipeTransform {
  /**
   * Transforms a [longitude, latitude] coordinate by rotating it by the provided angle.
   *
   * @param value The input coordinate as [lon, lat] in degrees.
   * @param angle The rotation angle in radians.
   * @returns The modified input coordinate.
   */
  transform(value: Coordinate, angle: number): Coordinate;

  /**
   * Returns null when the input coordinate is null or undefined.
   *
   * @param value The input coordinate, or null/undefined.
   * @param angle The rotation angle in radians; ignored when value is null/undefined.
   * @returns null
   */
  transform(value: null | undefined, angle: number): null;

  /**
   * Implementation signature for the transform operation. Rotates the input [lon, lat] coordinate
   * by the provided angle, or returns null when the input is null/undefined.
   *
   * @param value The input coordinate as [lon, lat] in degrees, or null/undefined.
   * @param angle The rotation angle in radians.
   * @returns The modified input coordinate, or null if the input is null/undefined.
   */
  transform(value: Coordinate | null | undefined, angle: number): Coordinate | null {
    return isNil(value) ? null : rotate(value, angle);
  }
}
