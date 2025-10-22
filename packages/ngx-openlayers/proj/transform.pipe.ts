import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@workletjs/ngx-openlayers/core/utils';
import { Coordinate } from 'ol/coordinate';
import { ProjectionLike, transform } from 'ol/proj';

@Pipe({
  name: 'wolTransform',
})
export class WolTransformPipe implements PipeTransform {
  transform(value: Coordinate, source: ProjectionLike, destination: ProjectionLike): Coordinate;
  transform(value: null | undefined, source: ProjectionLike, destination: ProjectionLike): null;
  transform(
    value: Coordinate | null | undefined,
    source: ProjectionLike,
    destination: ProjectionLike,
  ): Coordinate | null {
    return isNil(value) ? null : transform(value, source, destination);
  }
}
