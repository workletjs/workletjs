import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolDragAndDropInteractionModule } from '@workletjs/ngx-openlayers/interaction/drag-and-drop';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { DragAndDropEvent } from 'ol/interaction/DragAndDrop';
import GPX from 'ol/format/GPX';
import GeoJSON from 'ol/format/GeoJSON';
import IGC from 'ol/format/IGC';
import KML from 'ol/format/KML';
import TopoJSON from 'ol/format/TopoJSON';
import VectorSource from 'ol/source/Vector';

@Component({
  selector: 'wol-drag-and-drop-interaction-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    WolMapModule,
    WolViewModule,
    WolDragAndDropInteractionModule,
    WolTileLayerModule,
    WolVectorLayerModule,
    WolImageTileSourceModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-drag-and-drop-interaction
        [wolFormatConstructors]="formats()"
        (wolAddFeatures)="onDropVectorFile($event)"
      />
      <wol-tile-layer>
        <wol-image-tile-source
          [wolAttributions]="attributions"
          [wolUrl]="'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key"
          [wolTileSize]="512"
          [wolMaxZoom]="20"
        />
      </wol-tile-layer>
      @for (vectorFile of vectorFiles(); track vectorFile.file) {
        <wol-vector-layer (wolSourceChange)="fitSourceExtent($event)">
          <wol-vector-source [wolFeatures]="vectorFile.features" />
        </wol-vector-layer>
      }
    </wol-map>
    <div class="mt-4">
      <mat-checkbox [(ngModel)]="extractStyles">Extract styles from KML</mat-checkbox>
    </div>
    <div class="mt-4 flex items-center gap-2">
      <span>Download samples:</span>
      @for (item of sampleDataDownloads; track $index) {
        <a matButton="outlined" (click)="download(item.url, item.filename)">{{ item.name }}</a>
      }
    </div>
  `,
})
export class WolDragAndDropInteractionExampleComponent {
  // Get your own API key at https://www.maptiler.com/cloud/
  readonly key = '8OyphSYjlGSuAe4ZUCkV';
  readonly attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  readonly extractStyles = signal(true);
  readonly formats = computed(() => [
    new GPX(),
    new GeoJSON(),
    new IGC(),
    new KML({ extractStyles: this.extractStyles() }),
    new TopoJSON(),
  ]);
  readonly vectorFiles = signal<DragAndDropEvent[]>([]);

  readonly sampleDataDownloads = [
    {
      name: 'GPX',
      url: 'https://openlayers.org/en/latest/examples/data/gpx/fells_loop.gpx',
      filename: 'fells_loop.gpx',
    },
    {
      name: 'GeoJSON',
      url: 'https://openlayers.org/en/latest/examples/data/geojson/roads-seoul.geojson',
      filename: 'roads-seoul.geojson',
    },
    {
      name: 'IGC',
      url: 'https://openlayers.org/en/latest/examples/data/igc/Ulrich-Prinz.igc',
      filename: 'Ulrich-Prinz.igc',
    },
    {
      name: 'KML',
      url: 'https://openlayers.org/en/latest/examples/data/kml/states.kml',
      filename: 'states.kml',
    },
    {
      name: 'TopoJSON',
      url: 'https://openlayers.org/en/latest/examples/data/topojson/fr-departments.json',
      filename: 'fr-departments.json',
    },
  ];

  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapRef = viewChild.required(WolMapComponent);

  onDropVectorFile(event: DragAndDropEvent): void {
    this.vectorFiles.update((files) => [...files, event]);
  }

  fitSourceExtent(source?: VectorSource): void {
    const map = this.mapRef().getInstance();
    if (!source || !map) {
      return;
    }
    const extent = source.getExtent();
    map.getView().fit(extent);
  }

  download(url: string, filename: string): void {
    this.http
      .get(url, { responseType: 'blob' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const fileURL = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = fileURL;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(fileURL);
      });
  }
}
