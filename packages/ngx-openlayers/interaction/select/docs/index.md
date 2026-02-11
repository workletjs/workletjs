---
keyword: SelectInteractionPage
---

Interaction component for selecting vector features. By default, selected features are styled
differently, so this interaction can be used for visual highlighting, as well as selecting features
for other actions, such as modification or output.

There are three ways of controlling which features are selected:

- Using the browser event as defined by the condition and optionally the `wolToggleCondition`,
  `wolAddCondition`, `wolRemoveCondition`, and `wolMulti` properties.

- A `wolLayers` filter property.

- And a further feature filter using the `wolFilter` property.

## Examples

### Select Features

Choose between `Single-click`, `Click`, `Hover` and `Alt+Click` as the event type for selection in
the combobox below. When using `Single-click` or `Click` you can hold the `Shift` key to toggle the
feature in the selection.

**Note**: when `Single-click` is used double-clicks won't select features. This in contrast to
`Click`, where a double-click will both select the feature and zoom the map (because of the
`DoubleClickZoom` interaction). Note that `Single-click` is less responsive than `Click` because of
the delay it uses to detect double-clicks.

In this example, a listener is registered for the Select interaction's `select` event in order to
update the selection status above.

{{ NgDocActions.demo("WolSelectFeaturesExampleComponent") }}

### Select Features by Hover

In this example, the Select interaction reacts to the pointermove event for selection

{{ NgDocActions.demo("WolSelectHoverFeaturesExampleComponent") }}

### Select multiple Features

In this example, a listener is registered on the map's `singleclick` event to add and remove
features from an array.

{{ NgDocActions.demo("WolSelectMultipleFeaturesExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/select/select-interaction.component.ts#WolSelectInteractionComponent") }}
