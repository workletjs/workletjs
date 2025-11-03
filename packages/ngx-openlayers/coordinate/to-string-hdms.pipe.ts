import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@workletjs/ngx-openlayers/core/utils';
import { Coordinate, toStringHDMS } from 'ol/coordinate';

/**
 * Angular pipe that formats a geographic coordinate with the hemisphere, degrees, minutes, and seconds.
 * When the input is null or undefined, the pipe returns null for safe binding.
 *
 * Pipe name: `wolToStringHDMS`.
 *
 * Example usage:
 * ```html
 * <p>{{ [7.85, 47.983333] | wolToStringHDMS }}</p>
 * // out is now '47° 58′ 60″ N 7° 50′ 60″ E'
 * ```
 *
 * @remarks
 * - The input coordinate order is [longitude, latitude] in decimal degrees.
 * - If no number of digits is provided, OpenLayers will apply its default (default is 0).
 * - This pipe is intended for template usage; prefer direct calls to `toStringHDMS` in component logic when appropriate.
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#.toStringHDMS
 */
@Pipe({
  name: 'wolToStringHDMS',
})
export class WolToStringHDMSPipe implements PipeTransform {
  /**
   * Transforms a geographic [longitude, latitude] coordinate into a string with hemisphere, degrees, minutes, and seconds.
   *
   * @param value The input coordinate as [lon, lat] in degrees.
   * @param fractionDigits Optional number of digits to use for seconds; defaults to 0.
   * @returns The formatted coordinate string.
   */
  transform(value: Coordinate, fractionDigits?: number): string;

  /**
   * Returns null when the input coordinate is null or undefined.
   *
   * @param value The input coordinate, or null/undefined.
   * @param fractionDigits Optional number of digits to use for seconds; ignored when value is null/undefined.
   * @returns null
   */
  transform(value: null | undefined, fractionDigits?: number): null;

  /**
   * Implementation signature for the transform operation. Formats the input [lon, lat] coordinate
   * to a string with hemisphere, degrees, minutes, and seconds, or returns null when the input is null/undefined.
   *
   * @param value The input coordinate as [lon, lat] in degrees, or null/undefined.
   * @param fractionDigits Optional number of digits to use for seconds.
   * @returns The formatted coordinate string, or null if the input is null/undefined.
   */
  transform(value: Coordinate | null | undefined, fractionDigits?: number): string | null {
    return isNil(value) ? null : toStringHDMS(value, fractionDigits);
  }
}
