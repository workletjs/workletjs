import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import {
  WolLinkInteractionComponent,
  WolLinkInteractionModule,
} from '@workletjs/ngx-openlayers/interaction/link';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';

@Component({
  selector: 'wol-link-interaction-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatCheckboxModule,
    WolMapModule,
    WolViewModule,
    WolLinkInteractionModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-link-interaction />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
    <div class="mt-4">
      <mat-checkbox [ngModel]="checked()" (ngModelChange)="updateChecked($event)">
        See the "example" search parameter update when toggling this checkbox.
      </mat-checkbox>
    </div>
  `,
})
export class WolLinkInteractionExampleComponent {
  readonly checked = signal(false);

  private readonly linkInteractionRef = viewChild.required(WolLinkInteractionComponent);

  constructor() {
    afterNextRender(() => {
      const linkInteraction = this.linkInteractionRef().getInstance();

      const initialValue = linkInteraction?.track('example', (value) => {
        this.checked.set(value === 'checked');
      });

      this.checked.set(initialValue === 'checked');
    });
  }

  updateChecked(checked: boolean): void {
    const linkInteraction = this.linkInteractionRef().getInstance();

    if (checked) {
      linkInteraction?.update('example', 'checked');
    } else {
      linkInteraction?.update('example', null);
    }
  }
}
