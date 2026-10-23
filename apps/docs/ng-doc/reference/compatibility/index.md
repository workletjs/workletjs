## Version compatibility matrix

Version `22.2.0` requires Angular Core and CDK `~22.2.0` and OpenLayers `~10.11.0`. Earlier releases
retain their original peer dependencies; use the row for the version you install.

| Workletjs | Angular | OpenLayers |
| --------- | ------- | ---------- |
| 22.2.0    | ~22.2.0 | ~10.11.0   |
| ~22.0.0   | ~22.0.0 | ~10.9.0    |
| ~21.2.0   | ~21.2.0 | ~10.8.0    |
| ~21.1.0   | ~21.1.0 | ~10.8.0    |
| ~21.0.0   | ^21.0.0 | ^10.7.0    |
| <=0.7.0   | ^20.2.0 | ^10.6.1    |

Angular Core and CDK use the same Angular version range shown above.

## Check the package you install

For a registry release, inspect its own peer dependencies:

```bash
npm view @workletjs/ngx-openlayers@<version> peerDependencies
```

For a local build, inspect `peerDependencies` in the built package's `package.json`; its
requirements are authoritative. Catalog versions are resolved during packaging. Local source changes
do not change the metadata or features of an existing registry release.

The [Angular CLI collection](reference/angular-cli) is introduced in `22.2.0` and supports Angular
CLI 22.2.x standard workspaces. Earlier releases and other workspaces can follow
[manual installation](get-started/installation#manual-installation).
