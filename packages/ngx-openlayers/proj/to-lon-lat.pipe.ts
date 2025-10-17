import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@workletjs/ngx-openlayers/core/utils';
import { Coordinate } from 'ol/coordinate';
import { ProjectionLike, toLonLat } from 'ol/proj';

/**
 * Angular pipe that transforms coordinates from a given projection to longitude/latitude (EPSG:4326).
 * 
 * @remarks
 * This pipe wraps OpenLayers' `toLonLat` function to convert coordinates from any projection
 * to WGS84 longitude/latitude coordinates. It handles null and undefined values gracefully.
 * 
 * @example
 * ```html
 * <!-- In template -->
 * {{ [x, y] | wolToLonLat: 'EPSG:3857' }}
 * ```
 * 
 * @example
 * ```typescript
 * // In component
 * const lonLat = pipe.transform([1000000, 2000000], 'EPSG:3857');
 * ```
 * 
 * @remarks
 * The pipe handles null-safety by returning null when the input is null or undefined.
 * 
 * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_proj.html#.toLonLat | OpenLayers toLonLat}
 */
@Pipe({
  name: 'wolToLonLat',
})
export class WolToLonLatPipe implements PipeTransform {
  transform(value: Coordinate, projection?: ProjectionLike): Coordinate;
  transform(value: null | undefined, projection?: ProjectionLike): null;
  transform(value: Coordinate | null | undefined, projection?: ProjectionLike): Coordinate | null {
    return isNil(value) ? null : toLonLat(value, projection);
  }
}
