---
keyword: HeatmapLayerPage
---

Wraps an OpenLayers
[Heatmap](https://openlayers.org/en/latest/apidoc/module-ol_layer_Heatmap-Heatmap.html) layer, which
renders vector point data as a heatmap.

## Usage

```html
<wol-map>
  <wol-heatmap-layer [wolSource]="source" [wolRadius]="10"></wol-heatmap-layer>
</wol-map>
```

## Examples

### Earthquakes Heatmap

This example parses a KML file and renders the features as a
[Heatmap](components/layers/heatmap-layer) layer.

{{ NgDocActions.demo("WolHeatmapEarthquakesExampleComponent") }}

### Trajectories Heatmap

This example shows linear geometries rendered using a [Heatmap](components/layers/heatmap-layer)
layer. Data is AIS maritime traffic around Gothenburg transformed into GeoJSON, taken from
[this example](https://movingpandas.github.io/movingpandas-website/2-analysis-examples/ship-data.html).

{{ NgDocActions.demo("WolHeatmapTrajectoriesExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/heatmap/heatmap-layer.component.ts#WolHeatmapLayerComponent") }}
