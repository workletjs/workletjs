# GitHub Prerelease Design

## Problem

The publish workflow derives an npm dist-tag for SemVer prerelease versions, but the GitHub
Release created for the same tag is always treated as a stable release. Tags such as
`v22.0.0-alpha.1`, `v22.0.0-beta.0`, and `v22.0.0-rc.2` must create GitHub prereleases.

## Goals

- Mark every valid SemVer prerelease as a GitHub prerelease, regardless of its identifier.
- Keep stable SemVer versions as normal GitHub releases.
- Avoid treating a hyphen inside build metadata as a prerelease marker.
- Preserve the existing npm dist-tag behavior.

## Non-goals

- Restricting prereleases to `alpha`, `beta`, or `rc` identifiers.
- Changing tag naming, package version validation, release notes, or npm publishing behavior.
- Changing the disabled standalone GitHub Release workflow.

## Design

Extend the existing `Pre-publish validation` shell logic with a focused helper that returns the
GitHub prerelease input as `true` or `false`. The helper will reuse the existing SemVer validation
performed by `resolve_npm_dist_tag`, remove any `+build` metadata, and then check whether the
remaining version contains a prerelease component.

The validation step will write the result to `GITHUB_PRERELEASE` through `$GITHUB_ENV`. The later
`softprops/action-gh-release@v3` step will pass that value through its supported `prerelease` input:

```yaml
prerelease: ${{ env.GITHUB_PRERELEASE }}
```

This keeps release classification next to the existing validated distribution metadata and avoids
duplicating version parsing in the earlier tag-resolution step.

## Expected Behavior

- `22.0.0` produces `false`.
- `22.0.0-alpha.1`, `22.0.0-beta.0`, `22.0.0-rc.2`, and `22.0.0-next.1` produce `true`.
- `22.0.0+build-alpha` produces `false` because the hyphen is part of build metadata.
- Invalid versions continue to fail validation.

## Testing

Extend `scripts/npm-dist-tag.spec.mjs` so the existing workflow-level shell tests cover stable,
arbitrary prerelease, and build-metadata versions. Add an assertion that the GitHub Release action
receives `env.GITHUB_PRERELEASE` through its `prerelease` input.

Follow the red-green cycle: add the new assertions first and confirm they fail because the helper
and action input do not exist, then implement the minimal workflow change and rerun the focused
test suite.

## Risks and Mitigations

- **Build metadata false positive:** Remove the `+build` suffix before checking for a prerelease
  separator.
- **Invalid version classification:** Reuse the existing SemVer validation before returning a
  boolean.
- **Workflow wiring regression:** Assert both environment export and action input wiring in the
  Node test.
