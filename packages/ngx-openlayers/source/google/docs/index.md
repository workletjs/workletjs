---
keyword: GoogleSourcePage
---

A tile layer source component that renders tiles from the
[Google Map Tiles API](https://developers.google.com/maps/documentation/tile/overview).

After the component initialized, it takes properties that are bind to the component to create a
session token. Refer to the
[documentation](https://developers.google.com/maps/documentation/tile/session_tokens#required_fields)
for additional details.

## Examples

### Google Maps

This example demonstrates how to display tiles from Google's Map Tiles API in a map. To use the
Google Map Tiles API, you need to set up a Google Cloud project and create an API key for your
application. See the
[Map Tiles API documentation](https://developers.google.com/maps/documentation/tile/overview) for
instructions.

The `Google` source component can be used with a [tile layer](/layers/tile) and is configured by
binding properties to the component that are used in creating the
[session token request](https://developers.google.com/maps/documentation/tile/session_tokens) for
accessing the tiles. The `wolMapType` defaults to `'roadmap'` and can be changed to any of the
[supported map types](https://developers.google.com/maps/documentation/tile/session_tokens#required_fields).

When using the `Google` source component, please make sure you comply with the Google
[Map Tiles API Policies](https://developers.google.com/maps/documentation/tile/policies), by adding
the [Google logo](https://developers.google.com/maps/documentation/tile/policies#logo) in the
bottom-left corner of the map. You can add the logo as a static image by using a custom OpenLayers
control, as shown in the example below.

{{ NgDocActions.demo("WolGoogleMapsExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/google/google-source.component.ts#WolGoogleSourceComponent") }}
