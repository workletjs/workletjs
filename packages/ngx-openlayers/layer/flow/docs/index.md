---
keyword: FlowLayerPage
---

Layer component that renders particles moving through a vector field.

> **Warning** **CRITICAL:** FlowLayer is experimental. The component may change in future releases.
> Avoid using experimental components in production applications without understanding the risks.

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
