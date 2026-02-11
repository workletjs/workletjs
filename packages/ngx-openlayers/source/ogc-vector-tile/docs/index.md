---
keyword: OGCVectorTileSourcePage
---

Layer source for map tiles from an [OGC API - Tiles](https://ogcapi.ogc.org/tiles/) service that
provides "vector" type tiles.

The service must conform to at least the
[core](http://www.opengis.net/spec/ogcapi-tiles-1/1.0/conf/core) and
[tileset](http://www.opengis.net/spec/ogcapi-tiles-1/1.0/conf/tileset) conformance classes. For
supporting the collections option, the service must conform to the collections
[selection](http://www.opengis.net/spec/ogcapi-tiles-1/1.0/conf/collections-selection) conformance
class.

Vector tile sets may come in a variety of formats (e.g. GeoJSON, MVT). The `wolFormat` property is
used to determine which of the advertised media types is used. If you need to force the use of a
particular media type, you can provide the `wolMediaType` property.

## Examples

### OGC Vector Tiles

The [OGC API – Tiles](https://ogcapi.ogc.org/tiles/) specification describes how a service can
provide vector tiles.

{{ NgDocActions.demo("WolOGCVectorTilesExampleComponent") }}

### OGC Vector Tiles (Geographic)

The [OGC API – Tiles](https://ogcapi.ogc.org/tiles/) specification describes how a service can
provide vector tiles.

{{ NgDocActions.demo("WolOGCVectorTilesGeographicExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/ogc-vector-tile/ogc-vector-tile-source.component.ts#WolOGCVectorTileSourceComponent") }}
