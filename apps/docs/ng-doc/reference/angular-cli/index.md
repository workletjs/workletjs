These schematics support **Angular CLI 22.2.x standard workspaces**. Use a build or release that
contains this collection; these commands are not retroactively available in earlier published
`22.0.x` packages. Nx host workspaces are outside this first version's support.

Run from an existing Angular workspace:

```bash
ng add @workletjs/ngx-openlayers --project my-app
```

The command saves the library as an application dependency, adds missing compatible CDK and
OpenLayers dependencies, and configures OpenLayers global CSS. It preserves compatible dependency
declarations and reports conflicts instead of upgrading Angular. Requirements come from the
installed library's peer dependencies, including when you install a local package build.

An interactive prompt asks whether to generate a **map example**, defaulting to **No**. Explicit
`--example` or `--no-example` skips that prompt; non-interactive runs also default to no example.

```bash
ng add @workletjs/ngx-openlayers --project my-app --no-example
ng add @workletjs/ngx-openlayers --project my-app --example
ng add @workletjs/ngx-openlayers --project my-app --example --example-name demo-map --route demo
```

The default example is `map-example` at `/map`; the customized example above is available at
`/demo`. It uses public standalone components, an OSM tile layer, a `[0, 0]` center, zoom `2`, a
`400px` map height, and keyboard focus. Existing root templates and home pages are preserved. Its
lazy route is inserted first while retaining the relative order of existing routes.

## Create a map application

In an existing workspace that has this library installed, generate a **map application template**:

```bash
ng generate @workletjs/ngx-openlayers:application map-app
ng generate @workletjs/ngx-openlayers:application city-map --project-root apps/city-map --example-name city-view --route explore
ng serve city-map
```

The official Angular application generator creates the base application. The template uses
standalone, zoneless, CSS, Router, and Vitest, without SSR. Its home page redirects to `/map`, or
`/explore` in the customized example above. Existing workspace defaults do not override these fixed
template choices.

## Options

| Option                       | Command       | Default / behavior                                                                          |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `<name>`                     | `application` | Required application name; follows Angular's validation.                                    |
| `--project`                  | `ng add`      | Current CLI directory's application, or the only application; otherwise specify explicitly. |
| `--example` / `--no-example` | `ng add`      | Interactive confirmation, default No; false in non-interactive runs.                        |
| `--example-name`             | Both          | `map-example`; one lowercase kebab-case segment.                                            |
| `--route`                    | Both          | `map`; one lowercase kebab-case segment, without a leading slash.                           |
| `--project-root`             | `application` | Uses the official generator's workspace location convention.                                |
| `--skip-install`             | Both          | `false`; skips the schematic's follow-up dependency installation.                           |

Names and routes start with a lowercase letter and contain lowercase letters, digits, and single
hyphens separating nonempty segments. Nested paths, route parameters, wildcards, and query strings
are not accepted. `--example-name` and `--route` only affect `ng add` when the example is enabled.
`--skip-install` does not skip Angular CLI's installation of the library itself.

## Requirements and errors

Automatic examples require an existing standalone application with Router and a primary outlet in
its root component. NgModule applications and apps without routing can use the dependency and style
setup with `--no-example`. The schematic does not add Router or rewrite the root template.

Static route arrays may be inline, in a local variable, or directly imported from a relative module.
Dynamic configuration, spread arrays, path aliases, and indirect configuration composition are
rejected with guidance for manual setup. The application generator creates its own Router and
outlet, so these existing-app conditions do not require manual setup for new applications.

| Error                                                                | What to do                                                                                                                                                                              |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Several candidate applications                                       | Retry with `--project <application>`.                                                                                                                                                   |
| Incompatible dependency                                              | Use versions satisfying the installed library's peer dependencies, then retry. For local/tag/non-semver declarations, install first so the actual version can be checked.               |
| Missing Router/outlet, NgModule, or unsupported static configuration | Use `--no-example` and follow [manual installation](get-started/installation#manual-installation), or adjust the standalone application's static routing configuration before retrying. |
| Existing route, conflicting file, or partial example                 | Choose a different valid name/path, or resolve the existing state manually; user files are not overwritten.                                                                             |

Repeating the same successful setup does not duplicate styles, routes, or files, and preserves edits
to an already complete example. Requesting a different route for the same component does not create
an alias. Validation completes before schematic Tree edits are applied; it does not roll back the
library installation Angular CLI may already have performed.

The collection follows the
[official Angular library schematics workflow](https://angular.dev/tools/cli/schematics-for-libraries).
