import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@workletjs/ngx-openlayers/core/utils';
import { add, Coordinate } from 'ol/coordinate';

/**
 * Angular pipe that adds `delta` to `coordinate`. `coordinate` is modified in place and returned by the function.
 * When the input is null or undefined, the pipe returns null for safe binding.
 *
 * Pipe name: `wolAdd`.
 *
 * Example usage:
 * ```html
 * <p>{{ [7.85, 47.983333] | wolAdd: [-2, 4] }}</p>
 * // coord is now [5.85, 51.983333]
 * ```
 *
 * @remarks
 * - The input coordinate order is [longitude, latitude] in decimal degrees.
 * - This pipe is intended for template usage; prefer direct calls to `add` in component logic when appropriate.
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#.add
 */
@Pipe({
  name: 'wolAdd',
})
export class WolAddPipe implements PipeTransform {
  /**
   * Transforms a [longitude, latitude] coordinate by adding the provided delta coordinate.
   *
   * @param value The input coordinate as [lon, lat] in degrees.
   * @param delta The delta coordinate to add.
   * @returns The modified input coordinate.
   */
  transform(value: Coordinate, delta: Coordinate): Coordinate;

  /**
   * Returns null when the input coordinate is null or undefined.
   *
   * @param value The input coordinate, or null/undefined.
   * @param delta The delta coordinate to add; ignored when value is null/undefined.
   * @returns null
   */
  transform(value: null | undefined, delta: Coordinate): null;

  /**
   * Implementation signature for the transform operation. Adds the delta coordinate to the input [lon, lat] coordinate,
   * or returns null when the input is null/undefined.
   *
   * @param value The input coordinate as [lon, lat] in degrees, or null/undefined.
   * @param delta The delta coordinate to add.
   * @returns The modified input coordinate, or null if the input is null/undefined.
   */
  transform(value: Coordinate | null | undefined, delta: Coordinate): Coordinate | null {
    return isNil(value) ? null : add(value, delta);
  }
}
