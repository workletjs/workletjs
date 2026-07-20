import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const publishWorkflow = readFileSync(
  fileURLToPath(new URL('../.github/workflows/publish.yml', import.meta.url)),
  'utf8',
);
const releaseMetadataFunctions =
  publishWorkflow
    .match(
      /          resolve_npm_dist_tag\(\) \{\n[\s\S]*?\n          \}\n\n          resolve_github_prerelease\(\) \{\n[\s\S]*?\n          \}/,
    )?.[0]
    .replace(/^ {10}/gm, '') ?? '';

function resolveDistTag(version) {
  return spawnSync(
    'bash',
    ['-c', `${releaseMetadataFunctions}\nresolve_npm_dist_tag "$1"`, 'bash', version],
    {
      encoding: 'utf8',
    },
  );
}

function resolveGithubPrerelease(version) {
  return spawnSync(
    'bash',
    ['-c', `${releaseMetadataFunctions}\nresolve_github_prerelease "$1"`, 'bash', version],
    {
      encoding: 'utf8',
    },
  );
}

test('uses latest for a stable version', () => {
  const result = resolveDistTag('22.0.0');

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'latest');
});

test('uses the first prerelease identifier as the dist-tag', () => {
  for (const [version, expectedTag] of [
    ['22.0.0-alpha.1', 'alpha'],
    ['22.0.0-beta.0', 'beta'],
    ['22.0.0-rc.2', 'rc'],
  ]) {
    const result = resolveDistTag(version);

    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), expectedTag);
  }
});

test('rejects invalid versions and numeric prerelease tags', () => {
  for (const version of ['not-semver', '22.0.0-0']) {
    const result = resolveDistTag(version);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /cannot derive a safe npm dist-tag/i);
  }
});

test('publishes with the dist-tag derived during pre-publish validation', () => {
  assert.match(publishWorkflow, /NPM_DIST_TAG=\$\(resolve_npm_dist_tag "\$DIST_VERSION"\)/);
  assert.match(publishWorkflow, /--tag "\$NPM_DIST_TAG"/);
});

test('marks SemVer prerelease versions as GitHub prereleases', () => {
  for (const version of ['22.0.0-alpha.1', '22.0.0-beta.0', '22.0.0-rc.2', '22.0.0-next.1']) {
    const result = resolveGithubPrerelease(version);

    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'true');
  }
});

test('keeps stable and build-metadata-only versions as normal GitHub releases', () => {
  for (const version of ['22.0.0', '22.0.0+build-alpha']) {
    const result = resolveGithubPrerelease(version);

    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), 'false');
  }
});

test('passes the derived prerelease flag to the GitHub Release action', () => {
  assert.match(
    publishWorkflow,
    /GITHUB_PRERELEASE=\$\(resolve_github_prerelease "\$DIST_VERSION"\)/,
  );
  assert.match(publishWorkflow, /prerelease: \$\{\{ env\.GITHUB_PRERELEASE \}\}/);
});
