import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@workletjs/ngx-openlayers/core/utils';
import { Coordinate, format } from 'ol/coordinate';

/**
 * Angular pipe that transforms the given
 * [Coordinate](https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#~Coordinate)
 * to a string using the given string template. The strings `{x}` and `{y}` in the template will be
 * replaced with the first and second coordinate values respectively.
 *
 * When the input is null or undefined, the pipe returns null for safe binding.
 *
 * Pipe name: `wolFormat`.
 *
 * Example usage:
 * ```html
 * <p>{{ [[7.85, 47.983333]] | wolFormat:'Coordinate is ({x}|{y}).' }}</p>
 * // out is now 'Coordinate is (8|48).'
 * ```
 *
 * @remarks
 * - The input coordinate order is [longitude, latitude] in decimal degrees.
 * - If no number of digits is provided, OpenLayers will apply its default (default is undefined).
 * - This pipe is intended for template usage; prefer direct calls to `format` in component logic when appropriate.
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#.format
 */
@Pipe({
  name: 'wolFormat',
})
export class WolFormatPipe implements PipeTransform {
  /**
   * Transforms a [Coordinate](https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#~Coordinate)
   * into a string based on the provided template.
   *
   * @param value The input coordinate as [lon, lat] in degrees.
   * @param template The string template containing `{x}` and `{y}` placeholders.
   * @param fractionDigits Optional number of digits to use for each coordinate; defaults to undefined.
   * @returns The formatted coordinate string.
   */
  transform(value: Coordinate, template: string, fractionDigits?: number): string;

  /**
   * Returns null when the input coordinate is null or undefined.
   *
   * @param value The input coordinate, or null/undefined.
   * @param template The string template; ignored when value is null/undefined.
   * @param fractionDigits Optional number of digits to use for each coordinate; ignored when value is null/undefined.
   * @returns null
   */
  transform(value: null | undefined, template: string, fractionDigits?: number): null;

  /**
   * Implementation signature for the transform operation. Formats the input [lon, lat] coordinate
   * to a string based on the provided template, or returns null when the input is null/undefined.
   *
   * @param value The input coordinate as [lon, lat] in degrees, or null/undefined.
   * @param template The string template containing `{x}` and `{y}` placeholders.
   * @param fractionDigits Optional number of digits to use for each coordinate.
   * @returns The formatted coordinate string, or null if the input is null/undefined.
   */
  transform(
    value: Coordinate | null | undefined,
    template: string,
    fractionDigits?: number,
  ): string | null {
    return isNil(value) ? null : format(value, template, fractionDigits);
  }
}
