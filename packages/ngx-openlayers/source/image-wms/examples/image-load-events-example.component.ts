import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Renderer2,
  viewChild,
} from '@angular/core';
import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageWMSSourceModule } from '@workletjs/ngx-openlayers/source/image-wms';

@Component({
  selector: 'wol-image-load-events-example',
  imports: [WolMapModule, WolViewModule, WolImageLayerModule, WolImageWMSSourceModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wol-map class="h-96" (wolLoadStart)="showProgressBar()" (wolLoadEnd)="hideProgressBar()">
      <wol-view [wolCenter]="[-10997148, 4569099]" [wolZoom]="4" />
      <wol-image-layer>
        <wol-image-wms-source
          [wolUrl]="'https://ahocevar.com/geoserver/wms'"
          [wolParams]="{ LAYERS: 'topp:states' }"
          [wolServerType]="'geoserver'"
          (wolImageLoadStart)="addLoadingImage()"
          (wolImageLoadEnd)="addLoadedImage()"
          (wolImageLoadError)="addLoadedImage()"
        />
      </wol-image-layer>
    </wol-map>
    <div
      #progress
      class="absolute bottom-0 left-0 h-0.5 bg-sky-800/40 transition-[width] duration-200"
    ></div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }
  `,
})
export class WolImageLoadEventsExampleComponent {
  private readonly renderer = inject(Renderer2);
  private readonly progressRef = viewChild.required('progress', { read: ElementRef<HTMLElement> });
  private readonly progress = computed(() => this.progressRef().nativeElement);

  private loading = 0;
  private loaded = 0;

  showProgressBar(): void {
    this.renderer.setStyle(this.progress(), 'visibility', 'visible');
  }

  hideProgressBar(): void {
    setTimeout(() => {
      this.renderer.setStyle(this.progress(), 'visibility', 'hidden');
      this.renderer.setStyle(this.progress(), 'width', '0%');
    }, 200);
  }

  addLoadingImage(): void {
    ++this.loading;
    this.updateProgressBar();
  }

  addLoadedImage(): void {
    ++this.loaded;
    this.updateProgressBar();
  }

  updateProgressBar(): void {
    const width = ((this.loaded / this.loading) * 100).toFixed(1) + '%';
    this.renderer.setStyle(this.progress(), 'width', width);
  }
}
