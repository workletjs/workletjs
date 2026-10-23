Install the library in an existing Angular application, then continue to
[First Map](get-started/first-map).

## Prerequisites

Check [Compatibility](reference/compatibility) before choosing a version. Version `22.2.0` requires
Angular Core and CDK `~22.2.0` and OpenLayers `~10.11.0`. Earlier `22.0.x` releases require Angular
Core and CDK `~22.0.0` and OpenLayers `~10.9.0`. Requirements come from the installed package's peer
dependencies, including local builds.

## Angular CLI setup

The collection introduced in `22.2.0` supports **Angular CLI 22.2.x standard workspaces**. Earlier
`22.0.x` packages do not contain it. Nx host workspaces, earlier packages without the collection,
and applications you want to configure yourself can use
[manual installation](get-started/installation#manual-installation).

Run from an existing workspace:

```bash
ng add @workletjs/ngx-openlayers@22.2.0 --project my-app
```

This saves the library as an application dependency, adds missing compatible CDK and OpenLayers
dependencies, and configures OpenLayers global CSS. It preserves compatible dependency declarations
and reports conflicts instead of upgrading Angular.

The interactive prompt offers a **map example**, defaulting to **No**. Non-interactive runs also
default to no example. Choose explicitly to skip the prompt:

```bash
ng add @workletjs/ngx-openlayers@22.2.0 --project my-app --no-example
ng add @workletjs/ngx-openlayers@22.2.0 --project my-app --example
```

The example adds an independent map page at `/map`, preserving your existing root template and home
page. It requires a standalone application with Router and a primary outlet; applications without
those can use `--no-example` and add [First Map](get-started/first-map) manually.

See [Angular CLI](reference/angular-cli) for all options, errors, repeat-run behavior, and the **map
application template** that creates a new runnable application.

## Manual installation

For version `22.2.0`, use an Angular 22.2.x application and install the library with OpenLayers
`~10.11.0` and CDK `~22.2.0`. For another library version, choose Angular, CDK and OpenLayers
versions from that release's peer dependencies, which you can check with
`npm view @workletjs/ngx-openlayers@<version> peerDependencies`.

```bash group="Installation" name="npm"
npm install @workletjs/ngx-openlayers@22.2.0 'ol@~10.11.0' '@angular/cdk@~22.2.0' --save
```

```bash group="Installation" name="yarn"
yarn add @workletjs/ngx-openlayers@22.2.0 'ol@~10.11.0' '@angular/cdk@~22.2.0'
```

```bash group="Installation" name="pnpm"
pnpm add @workletjs/ngx-openlayers@22.2.0 'ol@~10.11.0' '@angular/cdk@~22.2.0'
```

### Global styles

Add OpenLayers CSS to your application's global `styles` in `angular.json`. CLI setup already
configures it; manual installations must include it:

```json name="angular.json"
{
  "styles": ["node_modules/ol/ol.css", "src/styles.css"]
}
```

Keep your application's existing global styles. In a workspace with another build tool, include
`ol/ol.css` through that tool's global stylesheet configuration.

### Component imports

Import standalone components from their secondary entry points, such as
`@workletjs/ngx-openlayers/map` and `@workletjs/ngx-openlayers/view`. The complete imports and sized
map container are shown in [First Map](get-started/first-map). Existing `WolMapModule` and other
component modules remain available; see [Component Usage](development/component-usage).
