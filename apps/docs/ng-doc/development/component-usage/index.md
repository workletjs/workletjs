These conventions describe the current source implementation. Start with
[First Map](get-started/first-map) for a minimal map, and use [Components](components) for each
component's API.

## Imports and composition

Import standalone components from their secondary entry points, such as
`@workletjs/ngx-openlayers/map` and `@workletjs/ngx-openlayers/view`. List only the components your
Angular template uses in its `imports`. The complete example below shows those public imports.
Existing NgModule imports remain available; for example, `WolViewModule` is exported from the same
View entry point and exports `WolViewComponent`.

Nesting connects supported components to their hosts. In this example, the View registers with its
Map, the tile layer registers with the Map, and the OSM source registers with the tile layer:

```text
Map
├── View
└── Tile layer
    └── OSM source
```

Use the host and layer/source combinations supported by the individual components. Moving a source
outside its supported layer does not create an independent map source.

{{ NgDocActions.demo("ComponentUsageExampleComponent") }}

The demo needs the [OpenLayers global styles](get-started/installation#global-styles). Its OSM tiles
require network access; the map container has an explicit `400px` height and can receive keyboard
focus.

## Inputs and events

Library selectors start with `wol-`; their Angular inputs and outputs use the `wol` prefix.
`[wolCenter]="[0, 0]"` passes a coordinate to the View, while
`(wolSingleClick)="onSingleClick($event)"` subscribes to the Map's single-click output.

Event payloads retain their OpenLayers types. The example's handler accepts
`MapBrowserEvent<PointerEvent>` and displays `event.coordinate`. The wrapper does not automatically
convert coordinates to longitude and latitude: OpenLayers uses its configured user projection, or
the View projection when no user projection is set. Perform any required projection conversion in
your application.

## Two-way state

The View's `wolZoom` is a `model()` property. Binding `[(wolZoom)]="zoom"` to an Angular writable
signal keeps application state and the View's zoom in sync. Press **Zoom in** to update the signal,
or use the map's zoom controls to update it from OpenLayers. The displayed zoom follows both.

The View also exposes `wolCenter`, `wolResolution`, and `wolRotation` as model properties. Two-way
binding applies to documented model properties; an ordinary input does not acquire a matching change
output merely because its name begins with `wol`.

## Runtime update boundaries

Binding an input does not guarantee that the underlying OpenLayers option updates after creation.
The current implementation makes these distinctions:

| Component  | Applied when the binding changes                                                                                              | Read when the instance is constructed                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| View       | `wolCenter`, `wolZoom`, `wolResolution`, `wolRotation`, `wolMinZoom`, `wolMaxZoom`, `wolConstrainResolution`, `wolProperties` | Examples: `wolProjection`, `wolExtent`, `wolPadding` |
| OSM source | `wolUrl`, `wolAttributions`, `wolTileLoadFunction`, `wolProperties`                                                           | Examples: `wolCrossOrigin`, `wolWrapX`, `wolMaxZoom` |

The construction column lists examples, not every construction option. For a construction-only
option, changing its Angular binding does not reconfigure the existing instance. Recreate the
component when that configuration must change. Check the specific component's implementation and API
when relying on another option.

Replace an object or array binding with a new value when updating it. Mutating the same object or
array in place is not a supported promise of synchronization with OpenLayers.

## Instances and lifecycle

The example queries `WolViewComponent` with `viewChild`. **Animate to start** obtains its current
OpenLayers View through `getInstance()` and calls `animate()` only after checking that the instance
exists. Resolve it when needed instead of retaining a reference across component removal.

The View creates its instance after Angular renders, using `afterNextRender`. A component query can
exist before that instance does; an Angular lifecycle hook such as `ngAfterViewInit` is not a
readiness guarantee. `getInstance()` can return `undefined` before creation and after destruction. A
previously retained instance is no longer valid for use through the component after it is destroyed.

Components manage their own host registration and wrapper event subscriptions. The View removes its
wrapper listeners and detaches from the Map on destruction. Your application must clean up any
additional listeners, subscriptions, or resources it creates; for example, remove your own
OpenLayers event keys with `unByKey` when the owning application component is destroyed.

See the [View reference](components/general/view) and [Map reference](components/general/map) for
individual inputs and outputs.
