---
keyword: HeatmapLayerPage
---

Layer for rendering vector data as a heatmap.

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
