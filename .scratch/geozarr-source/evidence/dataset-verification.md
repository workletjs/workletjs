# GeoZarr public dataset verification

Verified on 2026-10-15 (Asia/Shanghai), using the installed OpenLayers 10.11.0 in the geozarr-source
integration worktree. No repository files or preset URLs were changed. This is HTTP/OpenLayers data
verification; it does not replace browser WebGL rendering acceptance.

## Network boundary

The initial sandboxed curl requests both failed immediately with
`curl: (7) Failed to connect to 127.0.0.1 port 7897`: the configured local proxy is unreachable
inside the sandbox. Escalated requests were approved and succeeded. This initial error is a local
sandbox/network limitation, not evidence of remote data absence.

## Exact presets

- Krasnokuts'k:
  https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2C_MSIL2A_20260120T084301_N0511_R064_T36UXA_20260120T122910.zarr/measurements/reflectance
- Hvolsvöllur:
  https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr/measurements/reflectance

## Metadata HTTP evidence

Escalated `curl --connect-timeout 10 --max-time 25` GETs to each preset's `/zarr.json` returned
HTTP/2 200, `access-control-allow-origin: *`, `accept-ranges: bytes`, and exposed
`Content-Length,Content-Range`.

| Preset       | Metadata bytes | ETag                             | CRS        |
| ------------ | -------------: | -------------------------------- | ---------- |
| Krasnokuts'k |         192259 | bca768705c3e4cf22de5ee39f9df4e4c | EPSG:32636 |
| Hvolsvöllur  |         192277 | fd43f9a27a867ea4b5907054c348feb8 | EPSG:32627 |

Both JSON documents parse as Zarr v3 groups, include 82 consolidated metadata entries and six scale
levels (r10m, r20m, r60m, r120m, r360m, r720m).

Downloaded evidence files are `/private/tmp/geozarr-krasnokutsk-zarr.json` and
`/private/tmp/geozarr-hvolsvollur-zarr.json`.

## OpenLayers public initialization/view API evidence

Escalated Node 24.21.0 with `--use-env-proxy`, real `new GeoZarr({url, bands:['b04','b03','b02']})`,
per-request AbortSignal timeout 15 seconds, and total readiness timeout 45 seconds:

- Both sources transitioned `loading` to `ready` in about 2.3 seconds.
- Both `getDimensions()` returned `{}`.
- Both public `bandCount` values were 4: RGB plus the upstream generated alpha band.
- Both `getView()` promises resolved through the official helper chain `withLowerResolutions(1)`,
  `withHigherResolutions(2)`, `withExtentCenter()`, `withZoom(2)`.
- Helpers are exported from `ol/View.js` (withExtentCenter is called to produce the transform).
- Krasnokuts'k: projection EPSG:32636; center `[654900,5545140]`; zoom 2.
- Hvolsvöllur: projection EPSG:32627; center `[554880,7045140]`; zoom 2.
- Both helper result resolutions: `[1444.7368421052631,722.3684210526316,360,120,60,20,10,5,2.5]`.
- Only the two `/zarr.json` HTTP requests were needed for initialization; both returned 200. No
  private GeoZarr fields were read.

## Real tile HTTP/decode evidence

Separate run against both presets, native source CRS, public
`source.getTile(0,0,0,1,source.getProjection())`, public tile `load()`, `getState()`, `getData()`,
`getSize()` and `getError()`. Per-request timeout 15 seconds; total tile timeout 45 seconds.

- Both coarse r720m tile (0,0) loads reached TileState.LOADED (2) in about 13.4 seconds including
  initialization.
- Tile size `[152,152]`; data type Float32Array; length 92416 (=152*152*4); all 92416 values finite.
- Krasnokuts'k first RGBA pixel `[0.23852360248565674,0.24307985603809357,0.26580068469047546,1]`;
  aggregate min 0.04812916740775108, max 1.149013876914978.
- Hvolsvöllur first RGBA pixel `[0.0911145806312561,0.09591388702392578,0.15595833957195282,1]`;
  aggregate min -0.09989999979734421, max 1.5103000402450562.
- Each `r720m/b04/c/0/0`, `r720m/b03/c/0/0`, `r720m/b02/c/0/0` object returned HTTP 200 and sharding
  range requests returned HTTP 206 with valid Content-Range. Blosc/zstd sharding decoded
  successfully using installed OL/zarrita dependencies.
- No source parsing or tile decoding failures occurred; public tile.getError() was null/absent.

## Remaining acceptance

HTTP metadata, initialization, public view configuration, real coarse tiles, range requests, and
decoding pass for both exact presets. Browser checks still need production docs navigation, actual
RGB WebGL output/screenshots, user scene/custom/retry interactions, and failure UI. Successful Node
decoding does not prove those UI behaviors.
