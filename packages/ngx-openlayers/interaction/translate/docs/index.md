---
keyword: TranslateInteractionPage
---

Interaction component for translating (moving) features. If you want to translate multiple features in a single action (for example, the collection used by a select interaction), bind feature collection to `wolFeatures` property.

## Examples

### Translate Features

This example demonstrates how the [Translate](components/interactions/translate) and [Select](components/interactions/select) interaction component can be used together. Zoom in to an area of interest and click to select a feature or hold the `Shift` key and select multiple features. Then drag the features around to move them elsewhere on the map.

{{ NgDocActions.demo("WolTranslateFeaturesExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/translate/translate-interaction.component.ts#WolTranslateInteractionComponent") }}
