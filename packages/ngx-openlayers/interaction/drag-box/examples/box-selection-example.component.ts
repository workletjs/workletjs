import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { platformModifierKeyOnly } from 'ol/events/condition';
import { getWidth } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import DragBox, { DragBoxEvent } from 'ol/interaction/DragBox';
import { FilterFunction } from 'ol/interaction/Select';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style, { StyleFunction } from 'ol/style/Style';

import { WolDragBoxInteractionModule } from '@workletjs/ngx-openlayers/interaction/drag-box';
import { WolSelectInteractionModule } from '@workletjs/ngx-openlayers/interaction/select';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import {
  WolVectorSourceComponent,
  WolVectorSourceModule,
} from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-box-selection-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolDragBoxInteractionModule,
    WolSelectInteractionModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" [wolConstrainRotation]="16" />
      <wol-vector-layer [wolBackground]="'#1a2b39'" [wolStyle]="style">
        <wol-vector-source [wolUrl]="url" [wolFormat]="format" />
      </wol-vector-layer>
      <wol-select-interaction
        [wolFilter]="filter"
        [wolStyle]="selectedStyle"
        [wolFeatures]="selectedFeatures"
      />
      <wol-drag-box-interaction
        [wolCondition]="platformModifierKeyOnly"
        (wolBoxEnd)="onDragBoxEnd($event)"
        (wolBoxStart)="onDragBoxStart()"
      />
    </wol-map>
    <div class="mt-4 min-h-6">{{ selectedECORegions() }}</div>
  `,
})
export class WolBoxSelectionExampleComponent {
  readonly url = 'https://openlayers.org/data/vector/ecoregions.json';
  readonly format = new GeoJSON();
  readonly platformModifierKeyOnly = platformModifierKeyOnly;

  readonly style: StyleFunction = (feature) =>
    new Style({
      fill: new Fill({
        color: feature.get('COLOR_BIO') || '#eeeeee',
      }),
    });

  readonly selectedStyle: StyleFunction = (feature) =>
    new Style({
      fill: new Fill({
        color: feature.get('COLOR_BIO') || '#eeeeee',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
      }),
    });

  readonly filter: FilterFunction = (feature) => !(feature.get('COLOR_BIO') === '#CC6767');

  readonly selectedFeatures = new Collection<Feature>();
  readonly selectedECORegions = signal('');

  private readonly vectorSourceRef = viewChild.required(WolVectorSourceComponent);

  constructor() {
    const destroyRef = inject(DestroyRef);

    const eventsKey = this.selectedFeatures.on(['add', 'remove'], () => {
      const names = this.selectedFeatures.getArray().map((feature) => feature.get('ECO_NAME'));

      if (names.length > 0) {
        this.selectedECORegions.set(names.join(', '));
      } else {
        this.selectedECORegions.set('');
      }
    });
  }

  onDragBoxEnd(evt: DragBoxEvent): void {
    const dragBox = evt.target as DragBox;
    const map = dragBox.getMap();
    const vectorSource = this.vectorSourceRef().getInstance();

    if (!map || !vectorSource) {
      return;
    }

    const boxExtent = dragBox.getGeometry().getExtent();

    // if the extent crosses the antimeridian process each world separately
    const worldExtent = map.getView().getProjection().getExtent();
    const worldWidth = getWidth(worldExtent);
    const startWorld = Math.floor((boxExtent[0] - worldExtent[0]) / worldWidth);
    const endWorld = Math.floor((boxExtent[2] - worldExtent[0]) / worldWidth);

    for (let world = startWorld; world <= endWorld; ++world) {
      const left = Math.max(boxExtent[0] - world * worldWidth, worldExtent[0]);
      const right = Math.min(boxExtent[2] - world * worldWidth, worldExtent[2]);
      const extent = [left, boxExtent[1], right, boxExtent[3]];

      const boxFeatures = (vectorSource as VectorSource<Feature>)
        .getFeaturesInExtent(extent)
        .filter((feature) => feature.getGeometry()?.intersectsExtent(extent));

      // features that intersect the box geometry are added to the
      // collection of selected features

      // if the view is not obliquely rotated the box geometry and
      // its extent are equalivalent so intersecting features can
      // be added directly to the collection
      const rotation = map.getView().getRotation();
      const oblique = rotation % (Math.PI / 2) !== 0;

      // when the view is obliquely rotated the box extent will
      // exceed its geometry so both the box and the candidate
      // feature geometries are rotated around a common anchor
      // to confirm that, with the box geometry aligned with its
      // extent, the geometries intersect
      if (oblique) {
        const anchor = [0, 0];
        const geometry = dragBox.getGeometry().clone();
        geometry.translate(-world * worldWidth, 0);
        geometry.rotate(-rotation, anchor);
        const extent = geometry.getExtent();
        boxFeatures.forEach((feature) => {
          const geometry = feature.getGeometry()?.clone();

          if (!geometry) {
            return;
          }

          geometry.rotate(-rotation, anchor);
          if (geometry.intersectsExtent(extent)) {
            this.selectedFeatures.push(feature);
          }
        });
      } else {
        this.selectedFeatures.extend(boxFeatures);
      }
    }
  }

  onDragBoxStart(): void {
    this.selectedFeatures.clear();
  }
}
