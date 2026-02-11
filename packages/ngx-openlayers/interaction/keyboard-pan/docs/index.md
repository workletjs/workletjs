---
keyword: KeyboardPanInteractionPage
---

Interaction component that allows the user to pan the map using keyboard arrows.

By default, this is the map div, though you can change this with the `wolKeyboardEventTarget`
property in [Map](components/general/map) component. `document` never loses focus but, for any other
element, focus will have to be on, and returned to, this element if the keys are to function. See
also [KeyboardZoom](components/interactions/keyboard-zoom) component.

> **Note** Note that, although this interaction is by default included in maps, the keys can only be
> used when browser focus is on the element to which the keyboard events are attached.

## Examples

### Keyword Pan

This example shows how to use the arrow keys to pan the map with the `KeyboardPan` interaction
component.

The `KeyboardPan` interaction component is only activated when the `wol-map` element is focused.

{{ NgDocActions.demo("WolKeyboardPanInteractionExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/keyboard-pan/keyboard-pan-interaction.component.ts#WolKeyboardPanInteractionComponent") }}
