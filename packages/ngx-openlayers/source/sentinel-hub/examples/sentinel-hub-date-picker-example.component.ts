import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolSentinelHubSourceModule } from '@workletjs/ngx-openlayers/source/sentinel-hub';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { AuthConfig, Evalscript, ProcessRequestInputDataItem, Sample } from 'ol/source/SentinelHub';

@Component({
  selector: 'wol-sentinel-hub-date-picker-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    WolMapModule,
    WolViewModule,
    WolProjModule,
    WolWebGLTileLayerModule,
    WolSentinelHubSourceModule,
  ],
  template: `
    <div class="relative">
      <wol-map class="h-96">
        <wol-view
          [wolCenter]="[-108.6, 43.185] | wolFromLonLat"
          [wolZoom]="12"
          [wolMinZoom]="7"
          [wolMaxZoom]="13"
        />
        <wol-webgl-tile-layer>
          <wol-sentinel-hub-source
            [wolAuth]="auth()"
            [wolData]="data()"
            [wolEvalscript]="evalscript"
          />
        </wol-webgl-tile-layer>
      </wol-map>
      <div class="mt-4">
        <span>Show imagery from the week before</span>
        <mat-form-field class="ml-2" appearance="outline">
          <input matInput [matDatepicker]="picker" [(ngModel)]="date" />
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>
      </div>
      @if (authFormVisible()) {
        <form
          [formGroup]="authFormGroup"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div class="p-4 border-2 border-gray-900 bg-white rounded-md">
            <div>
              <label class="block">Client ID</label>
              <mat-form-field appearance="outline">
                <input matInput autofocus formControlName="clientId" />
              </mat-form-field>
            </div>
            <div>
              <label class="block">Client secret</label>
              <mat-form-field appearance="outline">
                <input matInput autofocus formControlName="clientSecret" />
              </mat-form-field>
            </div>
            <button class="w-full" matButton="filled" (click)="submitAuthForm()">show map</button>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    :host {
      --mat-form-field-container-height: 32px;
      --mat-form-field-container-vertical-padding: 6px;
      --mat-icon-button-state-layer-size: 32px;
    }
  `,
})
export class WolSentinelHubDatePickerExampleComponent {
  readonly date = signal<Date>(new Date('2024-06-01'));
  readonly data = computed<ProcessRequestInputDataItem[]>(() => {
    const toDate = this.date();
    const fromDate = new Date(toDate.getTime());

    fromDate.setDate(fromDate.getDate() - 7);

    return [
      {
        type: 'sentinel-2-l2a',
        dataFilter: {
          timeRange: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
        },
      },
    ];
  });
  readonly evalscript: Evalscript = {
    setup: () => ({
      input: ['B02', 'B03', 'B04'],
      output: { bands: 3 },
    }),
    evaluatePixel: (sample) => {
      const { B02, B03, B04 } = sample as Sample;
      return [3 * B04, 3 * B03, 3 * B02];
    },
  };
  readonly auth = signal<AuthConfig | undefined>(undefined);
  readonly authFormVisible = signal(true);
  readonly authFormGroup = new FormGroup({
    clientId: new FormControl('fa02a066-fc80-4cb4-af26-aae0af26cbf1', { nonNullable: true }),
    clientSecret: new FormControl('rate_limit_secret', { nonNullable: true }),
  });

  submitAuthForm(): void {
    const { clientId, clientSecret } = this.authFormGroup.getRawValue();
    this.auth.set({ clientId, clientSecret });
    this.authFormVisible.set(false);
  }
}
