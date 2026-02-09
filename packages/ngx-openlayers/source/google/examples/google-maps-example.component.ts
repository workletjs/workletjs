import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolGoogleSourceModule } from '@workletjs/ngx-openlayers/source/google';

@Component({
  selector: 'wol-google-maps-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    WolMapModule,
    WolViewModule,
    WolWebGLTileLayerModule,
    WolGoogleSourceModule,
  ],
  template: `
    @if (key(); as googleKey) {
      <wol-map class="h-96">
        <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
        <wol-webgl-tile-layer>
          <wol-google-source
            [wolKey]="googleKey"
            [wolScale]="'scaleFactor2x'"
            [wolHighDpi]="true"
          />
        </wol-webgl-tile-layer>
      </wol-map>
    } @else {
      <form class="flex h-96 flex-wrap items-center justify-center gap-2">
        <label for="">Your API key</label>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <input matInput [formControl]="keyFormControl" />
        </mat-form-field>
        <button matButton="filled" (click)="submitKeyForm()">show map</button>
      </form>
    }
  `,
})
export class WolGoogleMapsExampleComponent {
  readonly key = signal<string | null>(null);
  readonly keyFormControl = new FormControl<string | null>(null);

  submitKeyForm(): void {
    this.key.set(this.keyFormControl.getRawValue());
  }
}
