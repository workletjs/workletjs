import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@workletjs/ngx-openlayers/core/utils';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat, ProjectionLike } from 'ol/proj';

/**
 * Angular pipe that converts geographic coordinates from longitude/latitude ([lon, lat] in degrees, EPSG:4326)
 * to projected map coordinates using OpenLayers `fromLonLat`.
 *
 * Use this pipe in templates to project coordinates for display or interaction with OpenLayers components.
 * When the input is null or undefined, the pipe returns null for safe binding.
 *
 * Pipe name: `wolFromLonLat`.
 *
 * Example usage:
 *   [wolCenter]="[12.4924, 41.8902] | wolFromLonLat:'EPSG:3857'"
 *
 * @remarks
 * - The input coordinate order is [longitude, latitude] in decimal degrees.
 * - If no projection is provided, OpenLayers will apply its default (typically the current view’s projection).
 * - This pipe is intended for template usage; prefer direct calls to `fromLonLat` in component logic when appropriate.
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_proj.html#.fromLonLat
 */
@Pipe({
  name: 'wolFromLonLat',
})
export class WolFromLonLatPipe implements PipeTransform {
  /**
   * Transforms a geographic [longitude, latitude] coordinate (EPSG:4326, in degrees)
   * into the specified target projection.
   *
   * @param value The input coordinate as [lon, lat] in degrees.
   * @param projection Optional target projection or view (e.g., 'EPSG:3857'); defaults to the current view’s projection.
   * @returns The projected coordinate in map units of the target projection.
   */
  transform(value: Coordinate, projection?: ProjectionLike): Coordinate;
  /**
   * Returns null when the input coordinate is null or undefined.
   *
   * @param value The input coordinate, or null/undefined.
   * @param projection Optional target projection or view; ignored when value is null/undefined.
   * @returns null
   */
  transform(value: null | undefined, projection?: ProjectionLike): null;
  /**
   * Implementation signature for the transform operation. Projects the input [lon, lat] coordinate
   * to the target projection, or returns null when the input is null/undefined.
   *
   * @param value The input coordinate as [lon, lat] in degrees, or null/undefined.
   * @param projection Optional target projection or view.
   * @returns The projected coordinate, or null if the input is null/undefined.
   */
  transform(value: Coordinate | null | undefined, projection?: ProjectionLike): Coordinate | null {
    return isNil(value) ? null : fromLonLat(value, projection);
  }
}
