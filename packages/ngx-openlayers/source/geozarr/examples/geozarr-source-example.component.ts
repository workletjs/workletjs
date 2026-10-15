import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import View, {
  getView,
  withExtentCenter,
  withHigherResolutions,
  withLowerResolutions,
  withZoom,
} from 'ol/View';
import { Style } from 'ol/layer/WebGLTile';
import GeoZarr from 'ol/source/GeoZarr';

import { WolWebGLTileLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolGeoZarrSourceComponent } from '@workletjs/ngx-openlayers/source/geozarr';
import { WolOSMSourceComponent } from '@workletjs/ngx-openlayers/source/osm';

@Component({
  selector: 'wol-geozarr-source-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    WolMapComponent,
    WolWebGLTileLayerComponent,
    WolGeoZarrSourceComponent,
    WolOSMSourceComponent,
  ],
  template: `
    @for (request of requests(); track request.id) {
      <wol-map class="h-96" [wolView]="view()">
        <wol-webgl-tile-layer>
          <wol-osm-source />
        </wol-webgl-tile-layer>
        <wol-webgl-tile-layer [wolStyle]="style">
          <wol-geozarr-source
            #source="wolGeoZarrSource"
            [wolUrl]="request.url"
            [wolBands]="['b04', 'b03', 'b02']"
            (wolChange)="onSourceChange(request.id, source)"
            (wolTileLoadError)="onTileLoadError(request.id, source)"
          />
        </wol-webgl-tile-layer>
      </wol-map>
    }
    <div class="mt-4 flex flex-wrap items-center gap-4">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Scene</mat-label>
        <mat-select [(ngModel)]="selectedUrl">
          @for (scene of scenes; track scene.url) {
            <mat-option [value]="scene.url">{{ scene.name }}</mat-option>
          }
          <mat-option value="custom">Custom</mat-option>
        </mat-select>
      </mat-form-field>
      @if (selectedUrl() === 'custom') {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="min-w-64 flex-1">
          <mat-label>GeoZarr URL</mat-label>
          <input matInput [(ngModel)]="customUrl" placeholder="Enter Zarr URL" />
        </mat-form-field>
      }
      <button matButton="outlined" [disabled]="!draftUrl()" (click)="load()">Load</button>
    </div>
    @if (loading()) {
      <p class="mt-4" role="status">Loading dataset metadata...</p>
    } @else if (error()) {
      <p class="mt-4" role="alert">{{ error() }}</p>
    } @else {
      <p class="mt-4" role="status">Dataset ready.</p>
    }
    @if (tileLoadFailed()) {
      <p class="mt-2" role="alert">Some image tiles could not be loaded. Try Load again.</p>
    }
  `,
})
export class WolGeoZarrSourceExampleComponent {
  readonly scenes = [
    {
      name: "Sentinel-2 L2A (Krasnokuts'k)",
      url: 'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2C_MSIL2A_20260120T084301_N0511_R064_T36UXA_20260120T122910.zarr/measurements/reflectance',
    },
    {
      name: 'Sentinel-2 L2A (Hvolsvöllur)',
      url: 'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr/measurements/reflectance',
    },
  ];
  readonly style: Style = {
    gamma: 1.5,
    color: [
      'color',
      ['interpolate', ['linear'], ['band', 1], 0, 0, 0.5, 255],
      ['interpolate', ['linear'], ['band', 2], 0, 0, 0.5, 255],
      ['interpolate', ['linear'], ['band', 3], 0, 0, 0.5, 255],
    ],
  };
  readonly selectedUrl = signal(this.scenes[0].url);
  readonly customUrl = signal('');
  readonly draftUrl = computed(() =>
    (this.selectedUrl() === 'custom' ? this.customUrl() : this.selectedUrl()).trim(),
  );
  readonly requests = signal([{ id: 0, url: this.scenes[0].url }]);
  readonly view = signal<View | undefined>(undefined);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly tileLoadFailed = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private readonly sourceComponent = viewChild(WolGeoZarrSourceComponent);
  private nextLoadId = 0;
  private viewSource?: GeoZarr;

  load(): void {
    const url = this.draftUrl();
    if (!url) return;

    this.viewSource = undefined;
    this.view.set(undefined);
    this.loading.set(true);
    this.error.set(undefined);
    this.tileLoadFailed.set(false);
    this.requests.set([{ id: ++this.nextLoadId, url }]);
  }

  onSourceChange(id: number, component: WolGeoZarrSourceComponent): void {
    const source = component.getInstance();
    if (!source || !this.isCurrent(id, component, source)) return;

    if (source.getState() === 'error') {
      this.error.set(
        'Could not load the dataset. Check the URL, access permissions, and browser network requests, then try Load again.',
      );
      this.loading.set(false);
      return;
    }
    if (source.getState() !== 'ready' || this.viewSource === source) return;
    this.viewSource = source;

    // GeoZarr can leave its view promise pending after failed initialization.
    // Wait for readiness, then apply a concrete View only to the current load.
    getView(
      source,
      withLowerResolutions(1),
      withHigherResolutions(2),
      withExtentCenter(),
      withZoom(2),
    )
      .then((options) => {
        if (!this.isCurrent(id, component, source) || source.getState() !== 'ready') return;
        this.view.set(new View(options));
        this.loading.set(false);
      })
      .catch(() => {
        if (!this.isCurrent(id, component, source) || source.getState() !== 'ready') return;
        this.error.set('Could not configure the dataset view. Try Load again.');
        this.loading.set(false);
      });
  }

  onTileLoadError(id: number, component: WolGeoZarrSourceComponent): void {
    const source = component.getInstance();
    if (source && this.isCurrent(id, component, source)) this.tileLoadFailed.set(true);
  }

  private isCurrent(id: number, component: WolGeoZarrSourceComponent, source: GeoZarr): boolean {
    return (
      !this.destroyRef.destroyed &&
      this.requests()[0]?.id === id &&
      this.sourceComponent() === component &&
      component.getInstance() === source
    );
  }
}
