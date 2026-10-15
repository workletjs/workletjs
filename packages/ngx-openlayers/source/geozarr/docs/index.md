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

## Usage notes

Constructor inputs, including `wolUrl` and `wolDimensions`, are read once. Recreate the component to
apply a new configuration or retry loading. Only `wolAttributions` and `wolProperties` update the
existing source when their bindings change.

Use `wolBands` to select separate band arrays, or `wolVariable` for a single multidimensional array;
the two options are mutually exclusive. Initial `wolDimensions` selections can use indices or
coordinate labels. With `wolVariable`, one dimension can select an array of values to form output
bands in the supplied order.

To change a non-spatial selection such as time, use `updateDimensions()` through the component's
`getInstance()` method:

```ts
geoZarr.getInstance()?.updateDimensions({ time: 3 });
```

This method merges a partial map of **integer indices only** into the current selection. Coordinate
labels and arrays are supported only at initialization, and the dimension used to form multiple
output bands cannot be changed this way. Updating `wolDimensions` does not call this method.

Metadata loading is asynchronous. In a `wolChange` handler, inspect the source's `getState()` for
`loading`, `ready`, or `error`. Initialization failures emit `change` with state `error`, without
emitting `wolError`; tile read failures are reported separately by `wolTileLoadError`.

Wait for `ready` before resolving the metadata-based view: `getView()` may remain pending after an
initialization failure. The application supplies the map view and the layer's display style. The
example below constructs a concrete `View` from the resolved options and ignores results from
replaced or destroyed sources.

## Examples

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
