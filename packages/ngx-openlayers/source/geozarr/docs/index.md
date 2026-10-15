---
keyword: GeoZarrSourcePage
---

> **Warning** GeoZarr is experimental. The underlying OpenLayers GeoZarr source is not part of the
> stable API and may change between releases.

`wol-geozarr-source` provides geospatial raster data from a GeoZarr store to a compatible host. It
wraps the OpenLayers 10.11
[GeoZarr source](https://github.com/openlayers/openlayers/blob/v10.11.0/src/ol/source/GeoZarr.js),
including separate arrays for bands and a single multidimensional variable. A band represents a
measurement, such as red reflectance; layer styles map these measurements to display color channels.

## Imports and hosts

Import the component directly in an Angular component's `imports`:

```ts
import { WolGeoZarrSourceComponent } from '@workletjs/ngx-openlayers/source/geozarr';
```

Alternatively, import `WolGeoZarrSourceModule` from the same entry point. Both exports provide the
`wol-geozarr-source` selector and the `wolGeoZarrSource` template reference.

Place the source inside a `wol-webgl-tile-layer`, `wol-tile-layer`, `wol-flow-layer`, or
`wol-raster-source`. Creating it without a compatible host raises an error. Numerical raster bands
normally need a WebGL tile layer with an explicit `wolStyle`, as demonstrated below; registering a
source in another host does not automatically convert its data into display colors.

```html
<wol-map class="h-96" [wolView]="view">
  <wol-webgl-tile-layer [wolStyle]="style">
    <wol-geozarr-source
      #geoZarr="wolGeoZarrSource"
      [wolUrl]="url"
      [wolBands]="['b04', 'b03', 'b02']"
      (wolChange)="onSourceChange(geoZarr)"
    />
  </wol-webgl-tile-layer>
</wol-map>
```

The application supplies `url`, the layer `style`, and the map `view`. The source does not set or
update the map view automatically. Its instance is created after rendering and attached to the host
asynchronously. Destroying the component removes the source binding and its event listeners; this
does not promise to cancel OpenLayers metadata requests already in flight.

## Inputs

`wolUrl` is required. All other inputs are optional, and unspecified constructor options retain
OpenLayers defaults. The constructor inputs are read once, when the instance is created:

| Input             | Purpose                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `wolUrl`          | Store or group URL. With string bands, include the multiscales group path; with band objects, supply the base URL from which their group paths are resolved. |
| `wolBands`        | Band names, or `{ name, group }` objects for bands in different groups. Mutually exclusive with `wolVariable`.                                               |
| `wolVariable`     | Name of a single multidimensional data array. Use with `wolDimensions` to select its bands. Mutually exclusive with `wolBands`.                              |
| `wolDimensions`   | Initial non-spatial dimension selections: zero-based indices, coordinate labels, or supported arrays of selections.                                          |
| `wolStoreOptions` | Request `headers` and `credentials`, passed to the upstream store.                                                                                           |
| `wolProjection`   | Source projection; otherwise OpenLayers reads projection information from metadata.                                                                          |
| `wolTransition`   | Opacity transition duration in milliseconds; `0` disables it.                                                                                                |
| `wolWrapX`        | Whether tiles render beyond the tile grid extent.                                                                                                            |
| `wolResample`     | `linear` or `nearest` resampling when a band lacks a multiscale level.                                                                                       |
| `wolExtent`       | Fallback data extent in source-projection coordinates when metadata and coordinate arrays do not provide it.                                                 |
| `wolFlipY`        | Fallback orientation; `true` means south-up data, used only when orientation cannot be determined from the store.                                            |

Two additional inputs can also change after initialization, without replacing the source:

| Input             | Purpose                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `wolAttributions` | Initial and updated source attribution, applied through `setAttributions()`.                                          |
| `wolProperties`   | Initial and updated custom source properties, applied through `setProperties()`. Initial properties are set silently. |

Changing a constructor input, including `wolUrl` or `wolDimensions`, leaves the existing instance
and its host binding unchanged. To apply new constructor options, destroy and recreate the source
component, for example with Angular control flow keyed by a new load identifier. The interactive
example rebuilds the whole map for each Load, so its view resets and the same URL can be retried.
Simply changing the bound URL does not reload the source.

## Instance access and non-spatial dimensions

`getInstance()` returns the OpenLayers GeoZarr instance, or `undefined` before creation and after
destruction. Use it to call upstream methods such as `getDimensions()`, `getValue()`,
`updateDimensions()`, and `getView()`.

Non-spatial dimensions describe changes outside the spatial axes, such as time. `getDimensions()`
returns their names, sizes, and coordinate-array attributes. Once the source is ready,
`getValue(name, index)` reads a raw coordinate value for labeling a selection; interpret it using
the coordinate attributes. A dimension without a coordinate array returns `null` for its value.

For initial `wolDimensions`, omitted dimensions select index `0`. Coordinate labels are resolved
when the source initializes; use indices if the coordinate array cannot be read. With `wolVariable`,
at most one dimension can select an array of values to form several output bands, in the supplied
order. The component passes this configuration to OpenLayers without introducing additional
validation or data-layout rules.

For runtime slicing, call `updateDimensions()` on the instance. This takes a partial map of
**integer indices only**, merges it with the current selection, and preserves the source instance:

```ts
// geoZarr is the WolGeoZarrSourceComponent obtained from a template reference or view query.
geoZarr.getInstance()?.updateDimensions({ time: 3 });
```

Runtime updates do not accept coordinate labels or arrays, and cannot change the dimension used to
form multiple output bands. Updating the Angular `wolDimensions` input does not call this method.

## Events and initialization state

Each output forwards the original OpenLayers event and payload:

| Output              | OpenLayers event | Payload           |
| ------------------- | ---------------- | ----------------- |
| `wolChange`         | `change`         | `BaseEvent`       |
| `wolError`          | `error`          | `BaseEvent`       |
| `wolPropertyChange` | `propertychange` | `ObjectEvent`     |
| `wolTileLoadStart`  | `tileloadstart`  | `TileSourceEvent` |
| `wolTileLoadEnd`    | `tileloadend`    | `TileSourceEvent` |
| `wolTileLoadError`  | `tileloaderror`  | `TileSourceEvent` |

GeoZarr metadata initialization is asynchronous. In a `wolChange` handler, inspect
`component.getInstance()?.getState()` to distinguish `loading`, `ready`, and `error`. Initialization
failures set the state to `error` and emit `change`; they do **not** emit the native `error` event.
Listening only to `wolError` will miss these failures.

Wait for `ready` before resolving a metadata-based view. The promise returned by `getView()` may
remain pending after an initialization failure, so it is not a substitute for observing source
state. Resolve the view options and construct a concrete OpenLayers `View` before applying it to the
map. If the component is destroyed or a newer load has started, ignore the old asynchronous result.
The example shows this flow without reading private error fields or adding synthetic source events.

A `wolTileLoadError` indicates failure while reading a tile, separately from metadata
initialization. For initialization failures, check the URL, access permissions, and browser network
requests; retry by recreating the component.

## Example

### Sentinel-2 GeoZarr

This example follows the
[OpenLayers GeoZarr example](https://openlayers.org/en/latest/examples/geozarr.html). It
automatically loads the first of two Sentinel-2 L2A presets. Select another scene, or choose Custom
and enter a URL, then click Load. Editing the controls prepares the next request; Load applies it. A
blank custom URL cannot be loaded, and clicking Load again retries the same URL with a fresh map.

An OSM basemap sits beneath a true-color rendering of `b04`, `b03`, and `b02` in RGB order.
Reflectance from `0` to `0.5` maps to channel values from `0` to `255`, with gamma `1.5`. Metadata
provides the projection and extent; the view extends the available resolutions by one lower and two
higher levels, uses the extent center, and starts at zoom `2`.

Custom URLs must include the relevant group path, such as `store.zarr/measurements/reflectance`, and
provide these three bands. This example does not discover arbitrary band layouts or adapt the style
automatically. It displays metadata loading, initialization failures, and tile failures separately,
and ignores results from earlier loads.

{{ NgDocActions.demo("WolGeoZarrSourceExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/geozarr/geozarr-source.component.ts#WolGeoZarrSourceComponent") }}
