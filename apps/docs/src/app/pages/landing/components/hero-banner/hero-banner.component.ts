import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';

import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';

import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceComponent } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

interface MapLocation {
  readonly name: string;
  readonly longitudeLatitude: Coordinate;
  readonly zoom: number;
}

@Component({
  selector: 'wol-docs-hero-banner',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolOSMSourceComponent],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  readonly locations: readonly MapLocation[] = [
    { name: 'Alps', longitudeLatitude: [7.6586, 45.9763], zoom: 9 },
    { name: 'London', longitudeLatitude: [-0.1276, 51.5072], zoom: 11 },
    { name: 'Tokyo', longitudeLatitude: [139.7671, 35.6812], zoom: 11 },
  ];
  readonly center = signal<Coordinate | undefined>(fromLonLat(this.locations[0].longitudeLatitude));
  readonly zoom = signal<number | undefined>(this.locations[0].zoom);
  readonly selectedLocation = computed(() => {
    const center = this.center();
    const zoom = this.zoom();

    return this.locations.find((location) => {
      const expectedCenter = fromLonLat(location.longitudeLatitude);

      return (
        center !== undefined &&
        zoom !== undefined &&
        Math.abs(zoom - location.zoom) < 0.000001 &&
        expectedCenter.every((coordinate, index) => Math.abs(center[index] - coordinate) < 0.01)
      );
    });
  });
  readonly tileError = signal(false);
  readonly centerCode = computed(() =>
    (this.center() ?? []).map((coordinate) => Number(coordinate.toFixed(2))).join(', '),
  );
  readonly zoomCode = computed(() => Number((this.zoom() ?? 0).toFixed(2)));
  private readonly source = viewChild(WolOSMSourceComponent);

  selectLocation(location: MapLocation): void {
    if (this.tileError()) {
      this.source()?.getInstance()?.refresh();
    }

    this.center.set(fromLonLat(location.longitudeLatitude));
    this.zoom.set(location.zoom);
    this.tileError.set(false);
  }
}
