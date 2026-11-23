---
keyword: BingMapsSourcePage
---

Layer source for Bing Maps tile data. To use this source component you should get `Bing Maps API`
key at [https://www.bingmapsportal.com/](https://www.bingmapsportal.com/).

<ng-doc-blockquote type="alert" label="Deprecated">

OpenLayers deprecated the BingMaps source in 10.10 because Bing Maps for Enterprise is retiring. See
the [Azure Maps example](https://openlayers.org/en/latest/examples/azure-maps.html) for a
replacement using `ImageTile` and the
[upstream release note](https://github.com/openlayers/openlayers/releases/tag/v10.10.0) for context.

</ng-doc-blockquote>

## Examples

### Bing Maps

When the Bing Maps tile service doesn't have tiles for a given resolution and region it returns
placeholder tiles by default for `Aerial` and `OrdnanceSurvey` styles. Set `wolPlaceholderTiles` to
`false` before creating the source to suppress those placeholders.

{{ NgDocActions.demo("WolBingMapsExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/bing-maps/bing-maps-source.component.ts#WolBingMapsSourceComponent") }}
