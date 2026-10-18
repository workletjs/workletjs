## Version compatibility matrix

The current source requires Angular Core and CDK `~22.2.0` and OpenLayers `~10.11.0`. Its package
version remains `22.0.1`, and these upgrades have not been released. Existing published versions
retain their original peer dependencies; use the row for the release you install.

| Workletjs                                      | Angular | OpenLayers |
| ---------------------------------------------- | ------- | ---------- |
| Current source (`22.0.1`; upgrades unreleased) | ~22.2.0 | ~10.11.0   |
| Published ~22.0.0                              | ~22.0.0 | ~10.9.0    |
| Published ~21.2.0                              | ~21.2.0 | ~10.8.0    |
| Published ~21.1.0                              | ~21.1.0 | ~10.8.0    |
| Published ~21.0.0                              | ^21.0.0 | ^10.7.0    |
| Published <=0.7.0                              | ^20.2.0 | ^10.6.1    |

Angular Core and CDK use the same Angular version range shown above.

## Check the package you install

For a registry release, inspect its own peer dependencies:

```bash
npm view @workletjs/ngx-openlayers@<version> peerDependencies
```

For a local build, inspect `peerDependencies` in the built package's `package.json`; its
requirements are authoritative. The current source package resolves catalog versions during
packaging. An unchanged package version does not make source-only upgrades available in an earlier
registry build.

The [Angular CLI collection](reference/angular-cli) also requires a build or release that contains
it and supports Angular CLI 22.2.x standard workspaces. Earlier releases and other workspaces can
follow [manual installation](get-started/installation#manual-installation).
