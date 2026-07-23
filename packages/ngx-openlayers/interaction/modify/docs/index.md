---
keyword: ModifyInteractionPage
---

Interaction component for modifying feature geometries. To modify features that have been added to
an existing source, construct the modify interaction with the `wolSource` property. If you want to
modify features in a collection (for example, the collection used by a
[Select](components/interactions/select) interaction), construct the interaction with the
`wolFeatures` property. The interaction must be constructed with either a `wolSource` or
`wolFeatures` property.

Cartesian distance from the pointer is used to determine the features that will be modified. This
means that geometries will only be considered for modification when they are within the configured
`wolPixelTolerance`. For point geometries, the `wolHitDetection` property can be used to match their
visual appearance.

By default, the interaction will allow deletion of vertices when the `alt` key is pressed. To
configure the interaction with a different condition for deletion, use the `wolDeleteCondition`
property.

When editing geometries that share vertices (for example, adjacent polygons), the interaction uses
strict coordinate equality to determine which vertices are shared and should move together. Provide
a custom comparison function via `wolSharedVerticesEqual` if your geometries use reduced precision
or another equality rule.

## Examples

### Modify Features

This example demonstrates how the [Modify](components/interactions/modify) and
[Select](components/interactions/select) interaction components can be used together. Zoom in to an
area of interest and select a feature for editing. Then drag points around to modify the feature.
You can preserve topology by selecting multiple features before editing (`Shift+Click` to select
multiple features).

{{ NgDocActions.demo("WolModifyFeaturesExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/modify/modify-interaction.component.ts#WolModifyInteractionComponent") }}
