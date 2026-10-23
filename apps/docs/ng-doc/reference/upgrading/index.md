Review [Compatibility](reference/compatibility) and the installed package's peer dependencies before
upgrading. Version `22.2.0` requires Angular Core and CDK `~22.2.0` and OpenLayers `~10.11.0`.
Applications upgrading from `22.0.x` must update these dependencies together. The Angular CLI
collection supports standard Angular CLI 22.2.x workspaces and reports incompatible dependencies
instead of upgrading Angular; see [Angular CLI](reference/angular-cli) for setup options.

## Upgrading to OpenLayers 10.11

Version `22.2.0` adopts the upstream behavior changes in
[OpenLayers 10.10](https://github.com/openlayers/openlayers/releases/tag/v10.10.0) and
[OpenLayers 10.11](https://github.com/openlayers/openlayers/releases/tag/v10.11.0), while preserving
the existing Angular component API:

- Text drawn along a path requires `Intl.Segmenter`. If your application supports browsers without
  it, provide a [polyfill](https://formatjs.github.io/docs/polyfills/intl-segmenter/) in the host
  application; the component library does not include one.
- GeoJSON geometries with empty coordinate arrays are read as `null` geometries, except for
  `GeometryCollection`. Review any application handling of empty geometries.
- The `interpolate` style operator now mixes colors in sRGB on both Canvas and WebGL. Canvas
  gradients may change; use `interpolate-hcl` on Canvas to retain the previous gradient.
- WMTS capability parsing honors `TileMatrixSetLimits`. The tile grid extent comes only from an
  advertised `BoundingBox`, and `tileGrid.getExtent()` returns `null` without one. The first tile
  matrix determines world wrapping; override `wrapX: false` if a regional layer should stay in one
  world copy.
- OpenLayers has deprecated its BingMaps source. The existing BingMaps component remains available;
  plan a service migration using the upstream guidance.

Consult the [component reference](components) for the affected source and style APIs, and
[Component Usage](development/component-usage) for runtime update and lifecycle boundaries.
