---
keyword: SnapInteractionPage
---

Interaction component that handles snapping of vector features while modifying or drawing them. The features can come from a [VectorSource](https://openlayers.org/en/v10.6.1/apidoc/module-ol_source_Vector-VectorSource.html) or [Collection](https://openlayers.org/en/v10.6.1/apidoc/module-ol_Collection-Collection.html) Any interaction object that allows the user to interact with the features using the mouse can benefit from the snapping, as long as it is added before.

The snap interaction modifies map browser event `coordinate` and `pixel` properties to force the snap to occur to any interaction that uses them.

## Examples

### Snap Interaction

Example of using the [Snap](components/interactions/snap) interaction component together with [Draw](components/interactions/draw) and [Modify](components/interactions/modify) interaction components. The [Snap](components/interactions/snap) interaction component must be added last, as it needs to be the first to handle the `pointermove` event.

By default, the [Snap](components/interactions/snap) interaction component snaps to edges (`[wolEdge]="true"`) and vertices (`[wolVertex]="true"`). It can also be configured to snap to intersections between edges, which is done here with the `[wolIntersection]="true"` property.

{{ NgDocActions.demo("WolSnapInteractionExampleComponent") }}

### Snap Interaction with Custom Segmenter

The [Snap](components/interactions/snap) interaction component can be configured with a custom segmenter for each geometry type. In this example, a custom `LineString` segmenter adds snapping to the midpoint of each segment.

{{ NgDocActions.demo("WolSnapCustomSegmenterExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/snap/snap-interaction.component.ts#WolSnapInteractionComponent") }}
