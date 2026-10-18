After [Installation](get-started/installation), add this standalone component to your application.
The demo's source tab contains the complete component, including every import and its styles.

{{ NgDocActions.demo("FirstMapExampleComponent") }}

The map starts at center `[0, 0]` and zoom `2` with one OSM tile layer. Its explicit `400px` height
ensures a visible container. `tabindex="0"` lets users focus the map for keyboard interaction; click
or tab into the map before using the arrow and zoom keys.

Keep the OpenLayers [global styles](get-started/installation#global-styles) configured. OSM tile
images require network access. Center coordinates use the View's projection; the default is
EPSG:3857.

Continue with [Component Usage](development/component-usage) for composition, two-way state, events,
and instance access, or browse [Components](components) for individual APIs.
