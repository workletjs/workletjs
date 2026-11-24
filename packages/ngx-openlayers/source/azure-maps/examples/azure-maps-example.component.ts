import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolAzureMapsSourceModule } from '@workletjs/ngx-openlayers/source/azure-maps';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-azure-maps-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolAzureMapsSourceModule,
  ],
  template: `
    @if (key(); as azureKey) {
      <wol-map class="h-96">
        <wol-view [wolCenter]="[-6500000, 5000000]" [wolZoom]="3" />
        <wol-tile-layer>
          <wol-azure-maps-source
            [wolSubscriptionKey]="azureKey"
            [wolTilesetId]="selectedTileset()"
            wolAttributions="© Microsoft Azure Maps"
          />
        </wol-tile-layer>
      </wol-map>
      <div class="mt-4">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Tileset</mat-label>
          <mat-select [(ngModel)]="selectedTileset">
            @for (tileset of tilesets; track tileset.id) {
              <mat-option [value]="tileset.id">{{ tileset.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    } @else {
      <form class="flex h-96 flex-wrap items-center justify-center gap-2">
        <label for="azure-maps-key">Your Azure Maps subscription key</label>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <input id="azure-maps-key" matInput type="password" [formControl]="keyFormControl" />
        </mat-form-field>
        <button matButton="filled" type="button" (click)="submitKeyForm()">show map</button>
      </form>
    }
  `,
})
export class WolAzureMapsExampleComponent {
  readonly key = signal<string | null>(null);
  readonly keyFormControl = new FormControl<string | null>(null);
  readonly selectedTileset = signal('microsoft.base.road');
  readonly tilesets = [
    { id: 'microsoft.base.road', name: 'Road' },
    { id: 'microsoft.base.darkgrey', name: 'Dark grey' },
    { id: 'microsoft.base.hybrid.road', name: 'Hybrid road' },
    { id: 'microsoft.imagery', name: 'Imagery' },
  ];

  submitKeyForm(): void {
    const key = this.keyFormControl.getRawValue()?.trim();

    if (key) {
      this.key.set(key);
    }
  }
}
