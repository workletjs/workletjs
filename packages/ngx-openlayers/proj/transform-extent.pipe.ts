import { Pipe, PipeTransform } from '@angular/core';
import { isNil } from '@workletjs/ngx-openlayers/core/utils';
import { Extent } from 'ol/extent';
import { ProjectionLike, transformExtent } from 'ol/proj';

@Pipe({
  name: 'wolTransformExtent',
})
export class WolTransformExtentPipe implements PipeTransform {
  transform(
    value: Extent,
    source: ProjectionLike,
    destination: ProjectionLike,
    stops?: number,
  ): Extent;
  transform(
    value: null | undefined,
    source: ProjectionLike,
    destination: ProjectionLike,
    stops?: number,
  ): null;
  transform(
    value: Extent | null | undefined,
    source: ProjectionLike,
    destination: ProjectionLike,
    stops?: number,
  ): Extent | null {
    return isNil(value) ? null : transformExtent(value, source, destination, stops);
  }
}
