---
keyword: FlowLayerPage
---

> **Warning** **CRITICAL:** FlowLayer is experimental. The component may change in future releases.
> Avoid using experimental components in production applications without understanding the risks.

`wol-flow-layer` wraps OpenLayers `FlowLayer`, a WebGL-based tile layer that animates particles from
vector-field data. In practice, you provide a `DataTile` source whose bands encode velocity
components, set `wolMaxSpeed` to the maximum magnitude represented by that data, and optionally use
`wolStyle` to colorize the particles with expressions.

The component exposes the underlying layer options through Angular inputs and models, so visibility,
opacity, resolution limits, zoom constraints, preload behavior, and source changes can all be bound
declaratively. Style variables can also be updated reactively through `wolStyle` to drive the flow
color ramp from Angular state.

## Examples

### Wind

This example uses a flow layer component to render wind velocity. The input wind velocity data is
encoded in a PNG, and much of the example code is related to sampling that PNG and generating data
tiles representing a velocity field. The first band (or the red channel) of the data tile is the
east-west component vector of the wind velocity, and the second band (or green channel) is the
north-south component vector. The flow layer is configured with this data tile source and a style
for applying a color ramp based on wind speed.

{{ NgDocActions.demo("WolWindExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/flow/flow-layer.component.ts#WolFlowLayerComponent") }}
