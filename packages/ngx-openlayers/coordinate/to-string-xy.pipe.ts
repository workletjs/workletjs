import { Pipe, PipeTransform } from '@angular/core';

import { Coordinate, toStringXY } from 'ol/coordinate';

import { isNil } from '@workletjs/ngx-openlayers/core/utils';

/**
 * Angular pipe that formats a coordinate as a comma delimited string.
 * When the input is null or undefined, the pipe returns null for safe binding.
 *
 * Pipe name: `wolToStringXY`.
 *
 * Example usage:
 * ```html
 * <p>{{ [7.85, 47.983333] | wolToStringXY }}</p>
 * // out is now '8, 48'
 * ```
 *
 * @remarks
 * - The input coordinate order is [longitude, latitude] in decimal degrees.
 * - If no number of digits is provided, OpenLayers will apply its default (default is 0).
 * - This pipe is intended for template usage; prefer direct calls to `toStringXY` in component logic when appropriate.
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#.toStringXY
 */
@Pipe({
  name: 'wolToStringXY',
})
export class WolToStringXYPipe implements PipeTransform {
  /**
   * Transforms a [longitude, latitude] coordinate into a comma delimited string.
   *
   * @param value The input coordinate as [lon, lat] in degrees.
   * @param fractionDigits Optional number of digits to use for each coordinate; defaults to 0.
   * @returns The formatted coordinate string.
   */
  transform(value: Coordinate, fractionDigits?: number): string;

  /**
   * Returns null when the input coordinate is null or undefined.
   *
   * @param value The input coordinate, or null/undefined.
   * @param fractionDigits Optional number of digits to use for each coordinate; ignored when value is null/undefined.
   * @returns null
   */
  transform(value: null | undefined, fractionDigits?: number): null;

  /**
   * Implementation signature for the transform operation. Formats the input [lon, lat] coordinate
   * to a comma delimited string, or returns null when the input is null/undefined.
   *
   * @param value The input coordinate as [lon, lat] in degrees, or null/undefined.
   * @param fractionDigits Optional number of digits to use for each coordinate.
   * @returns The formatted coordinate string, or null if the input is null/undefined.
   */
  transform(value: Coordinate | null | undefined, fractionDigits?: number): string | null {
    return isNil(value) ? null : toStringXY(value, fractionDigits);
  }
}
