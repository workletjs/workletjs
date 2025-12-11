---
keyword: KeyboardZoomInteractionPage
---

Interaction component that allows the user to zoom the map using keyboard `+` and `-`. 

By default, this is the map div, though you can change this with the `wolKeyboardEventTarget` property in [Map](components/general/map) component. `document` never loses focus but, for any other element, focus will have to be on, and returned to, this element if the keys are to function. See also [KeyboardPan](components/interactions/keyboard-pan) component.

> **Note**
> Note that, although this interaction is by default included in maps, the keys can only be used when browser focus is on the element to which the keyboard events are attached.

## Examples

### Keyword Zoom

This example shows how to use the `+` and `-` keys can be used to zoom in and out the map with the `KeyboardZoom` interaction component.

The `KeyboardZoom` interaction component is only activated when the `wol-map` element is focused.

{{ NgDocActions.demo("WolKeyboardZoomInteractionExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/keyboard-zoom/keyboard-zoom-interaction.component.ts#WolKeyboardZoomInteractionComponent") }}
